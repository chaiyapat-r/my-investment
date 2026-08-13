using Api.Domain;
using Api.Services;

namespace Api.Tests;

public class ChartCalculatorTests
{
    private static DateOnly D(int day) => new(2026, 8, day);

    private static Snapshot Snap(int accountId, int day, decimal valueThb) => new()
    {
        AccountId = accountId,
        AsOfDate = D(day),
        ValueThb = valueThb,
        NativeAmount = valueThb,
        NativeCurrency = Currency.THB,
        FxRateUsed = 1m,
    };

    private static CashFlow Flow(int accountId, int day, Direction dir, decimal amountThb, int? counter = null) => new()
    {
        AccountId = accountId,
        OccurredOn = D(day),
        Direction = dir,
        Amount = amountThb,
        Currency = Currency.THB,
        FxRateUsed = 1m,
        AmountThb = amountThb,
        CounterAccountId = counter,
    };

    private static HashSet<int> Scope(params int[] ids) => [.. ids];

    // --- Forward-fill -------------------------------------------------------

    [Fact]
    public void ForwardFill_CarriesLastSnapshotAcrossAGap_AndMissingSnapshotContributesNothing()
    {
        // Account 1: snapshots on the 2nd and 16th (8th skipped).
        // Account 2: a single snapshot on the 9th — forces the 9th onto the axis.
        var snaps = new[]
        {
            Snap(1, 2, 100m), Snap(1, 16, 120m),
            Snap(2, 9, 50m),
        };

        var points = ChartCalculator.Build(Scope(1, 2), snaps, [], null, null);

        // 2nd: account 2 has no snapshot yet -> contributes NOTHING, not zero.
        Assert.Equal(100m, PointAt(points, D(2)).MarketValueThb);
        // 9th: account 1 forward-filled to 100 + account 2's 50 = 150.
        Assert.Equal(150m, PointAt(points, D(9)).MarketValueThb);
        // 16th: 120 + account 2 forward-filled 50 = 170.
        Assert.Equal(170m, PointAt(points, D(16)).MarketValueThb);
    }

    // --- Net contribution can go negative -----------------------------------

    [Fact]
    public void NetContribution_GoesNegative_WhenMoreWithdrawnThanDeposited()
    {
        var flows = new[]
        {
            Flow(1, 2, Direction.In, 100m),
            Flow(1, 9, Direction.Out, 150m),
        };

        var points = ChartCalculator.Build(Scope(1), [], flows, null, null);

        Assert.Equal(100m, PointAt(points, D(2)).NetContributionThb);
        Assert.Equal(-50m, PointAt(points, D(9)).NetContributionThb); // never clamped to 0
    }

    // --- Internal vs external cash flow -------------------------------------

    [Fact]
    public void InternalTransfer_BothAccountsInScope_Cancels()
    {
        // Baseline external deposit + an internal transfer bank(1) -> webull(2).
        var flows = new[]
        {
            Flow(1, 1, Direction.In, 200m),                 // salary into bank (external)
            Flow(1, 2, Direction.Out, 100m, counter: 2),    // transfer bank -> webull (internal)
        };
        // A snapshot on the transfer date puts the 2nd on the axis, so we can read
        // the net-contribution value at exactly that point.
        var snaps = new[] { Snap(1, 2, 300m) };

        // Net-worth view: both accounts in scope -> transfer nets to zero.
        var points = ChartCalculator.Build(Scope(1, 2), snaps, flows, null, null);
        Assert.Equal(200m, PointAt(points, D(2)).NetContributionThb); // transfer added nothing
    }

    [Fact]
    public void InternalTransfer_OnlyDestinationInScope_CountsAsExternal_EitherRecordingSide()
    {
        // Investment view: only webull(2) is in scope; bank(1) is out of scope.
        // Recorded on the source (bank, Out, counter=webull).
        var onSource = new[] { Flow(1, 2, Direction.Out, 100m, counter: 2) };
        var p1 = ChartCalculator.Build(Scope(2), [], onSource, null, null);
        Assert.Equal(100m, PointAt(p1, D(2)).NetContributionThb);

        // Same transfer recorded on the destination (webull, In, counter=bank).
        var onDest = new[] { Flow(2, 2, Direction.In, 100m, counter: 1) };
        var p2 = ChartCalculator.Build(Scope(2), [], onDest, null, null);
        Assert.Equal(100m, PointAt(p2, D(2)).NetContributionThb);
    }

    [Theory]
    // account in scope, no counter -> external, signed by direction
    [InlineData(1, null, "In", 100, new[] { 1 }, 100)]
    [InlineData(1, null, "Out", 100, new[] { 1 }, -100)]
    // account out of scope, no counter -> ignored
    [InlineData(9, null, "In", 100, new[] { 1 }, 0)]
    // transfer, both in scope -> cancels
    [InlineData(1, 2, "Out", 100, new[] { 1, 2 }, 0)]
    // transfer, this side in scope only -> signed by direction
    [InlineData(1, 2, "Out", 100, new[] { 1 }, -100)]
    // transfer, counter in scope only -> signed by OPPOSITE direction
    [InlineData(1, 2, "Out", 100, new[] { 2 }, 100)]
    public void ContributionDelta_ClassifiesEachCase(
        int accountId, int? counter, string dir, decimal amount, int[] scope, decimal expected)
    {
        var cf = Flow(accountId, 2, Enum.Parse<Direction>(dir), amount, counter);
        Assert.Equal(expected, ChartCalculator.ContributionDelta(cf, scope.ToHashSet()));
    }

    // --- Liabilities --------------------------------------------------------

    [Fact]
    public void Liability_NegativeValue_SubtractsFromNetWorth_WithNoSpecialCase()
    {
        var snaps = new[]
        {
            Snap(1, 2, 100m),   // asset
            Snap(2, 2, -30m),   // liability stored as negative ValueThb
        };

        var points = ChartCalculator.Build(Scope(1, 2), snaps, [], null, null);
        Assert.Equal(70m, PointAt(points, D(2)).MarketValueThb);
    }

    // --- The whole point: the profit gap ------------------------------------

    [Fact]
    public void TwoLines_ProfitGapIsMarketValueMinusNetContribution()
    {
        // Webull only. Deposit 100, grow to 115, deposit 50 more, worth 170.
        var snaps = new[] { Snap(1, 1, 100m), Snap(1, 8, 115m), Snap(1, 15, 170m) };
        var flows = new[] { Flow(1, 1, Direction.In, 100m), Flow(1, 15, Direction.In, 50m) };

        var points = ChartCalculator.Build(Scope(1), snaps, flows, null, null);

        var w1 = PointAt(points, D(1));
        Assert.Equal(100m, w1.MarketValueThb);
        Assert.Equal(100m, w1.NetContributionThb);
        Assert.Equal(0m, w1.MarketValueThb - w1.NetContributionThb);

        var w2 = PointAt(points, D(8));
        Assert.Equal(115m, w2.MarketValueThb);
        Assert.Equal(100m, w2.NetContributionThb);
        Assert.Equal(15m, w2.MarketValueThb - w2.NetContributionThb); // pure profit

        var w3 = PointAt(points, D(15));
        Assert.Equal(170m, w3.MarketValueThb);
        Assert.Equal(150m, w3.NetContributionThb);
        Assert.Equal(20m, w3.MarketValueThb - w3.NetContributionThb);
    }

    // --- Date range filtering ----------------------------------------------

    [Fact]
    public void Build_RespectsFromAndToBounds()
    {
        var snaps = new[] { Snap(1, 2, 10m), Snap(1, 9, 20m), Snap(1, 16, 30m) };

        var points = ChartCalculator.Build(Scope(1), snaps, [], D(9), D(9));

        Assert.Single(points);
        Assert.Equal(D(9), points[0].Date);
        Assert.Equal(20m, points[0].MarketValueThb);
    }

    // --- Banking balances count as capital (net contribution) ----------------

    [Fact]
    public void BankingBalance_CountsAsNetContribution_SoCashNeverShowsProfit()
    {
        // Account 1 = bank (capital), account 2 = an investment.
        var snaps = new[]
        {
            Snap(1, 1, 28_000m), // bank balance
            Snap(2, 1, 2_000m), Snap(2, 8, 2_500m), // BTC: bought at 2000, grows to 2500
        };
        var flows = new[]
        {
            Flow(2, 1, Direction.In, 2_000m), // 2000 moved into BTC
            Flow(1, 1, Direction.In, 999_999m), // a cash flow on the bank — must be IGNORED
        };

        // banking accounts = { 1 }
        var points = ChartCalculator.Build(Scope(1, 2), snaps, flows, null, null, Scope(1));

        // Day 1: bank 28k sits on both lines, BTC 2k on both → no profit yet.
        var d1 = PointAt(points, D(1));
        Assert.Equal(30_000m, d1.MarketValueThb);
        Assert.Equal(30_000m, d1.NetContributionThb);

        // Day 8: BTC rose 500, bank unchanged → profit is exactly the BTC gain.
        var d8 = PointAt(points, D(8));
        Assert.Equal(30_500m, d8.MarketValueThb);
        Assert.Equal(30_000m, d8.NetContributionThb);
        Assert.Equal(500m, d8.MarketValueThb - d8.NetContributionThb);
    }

    private static Api.Contracts.ChartPoint PointAt(IEnumerable<Api.Contracts.ChartPoint> points, DateOnly date) =>
        points.Single(p => p.Date == date);
}
