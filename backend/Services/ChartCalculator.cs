using Api.Contracts;
using Api.Domain;

namespace Api.Services;

/// <summary>
/// Pure money math for the two-line chart. No database, no DI — so the rules
/// that matter (forward-fill, internal vs external cash flow, the profit gap)
/// are unit-testable in isolation.
///
/// Convention: an internal transfer between the user's own accounts is recorded
/// as a SINGLE CashFlow with CounterAccountId set. Recording both legs would
/// double-count.
/// </summary>
public static class ChartCalculator
{
    /// <summary>
    /// Signed effect of one cash flow on the net-contribution line of the
    /// selected view. Positive = money entering the view; negative = leaving.
    /// Money that only moves between two in-scope accounts nets to zero.
    /// </summary>
    public static decimal ContributionDelta(CashFlow cf, ISet<int> inScope)
    {
        var accountIn = inScope.Contains(cf.AccountId);
        var counterIn = cf.CounterAccountId is int c && inScope.Contains(c);

        // Pure external flow (salary in, spend out): belongs to its account.
        if (cf.CounterAccountId is null)
            return accountIn ? Signed(cf.Direction, cf.AmountThb) : 0m;

        // Internal transfer — decided by whether the counter account is in scope.
        if (accountIn && counterIn) return 0m;                              // both inside → cancels
        if (accountIn) return Signed(cf.Direction, cf.AmountThb);           // this side inside, counter outside
        if (counterIn) return Signed(Opposite(cf.Direction), cf.AmountThb); // counter inside, this side outside
        return 0m;                                                          // neither in scope
    }

    private static decimal Signed(Direction d, decimal amount) => d == Direction.In ? amount : -amount;

    private static Direction Opposite(Direction d) => d == Direction.In ? Direction.Out : Direction.In;

    public static List<ChartPoint> Build(
        ISet<int> inScope,
        IReadOnlyList<Snapshot> snapshots,
        IReadOnlyList<CashFlow> cashFlows,
        DateOnly? from,
        DateOnly? to,
        ISet<int>? bankingAccountIds = null)
    {
        var banking = bankingAccountIds ?? new HashSet<int>();
        // Signed, view-relevant flows only, sorted by date for the running sum.
        // A banking account's balance already counts as net contribution, so any
        // cash flow recorded against it would double-count — ignore those.
        var flows = cashFlows
            .Where(cf => !banking.Contains(cf.AccountId))
            .Select(cf => (cf.OccurredOn, Delta: ContributionDelta(cf, inScope)))
            .Where(x => x.Delta != 0m)
            .OrderBy(x => x.OccurredOn)
            .ToList();

        // In-scope snapshots grouped per account, ordered for forward-fill.
        var byAccount = snapshots
            .Where(s => inScope.Contains(s.AccountId))
            .GroupBy(s => s.AccountId)
            .ToDictionary(g => g.Key, g => g.OrderBy(s => s.AsOfDate).ToList());

        // X-axis: every in-scope snapshot date plus every view-affecting flow date.
        var dates = new SortedSet<DateOnly>();
        foreach (var s in snapshots)
            if (inScope.Contains(s.AccountId)) dates.Add(s.AsOfDate);
        foreach (var f in flows)
            dates.Add(f.OccurredOn);

        var axis = dates
            .Where(d => (from is null || d >= from) && (to is null || d <= to))
            .ToList();

        var points = new List<ChartPoint>(axis.Count);
        foreach (var d in axis)
        {
            // Market value: forward-fill each account to its latest snapshot on or
            // before d. An account with no snapshot yet contributes nothing (not zero).
            // A banking account's balance is pure capital, so it also counts as net
            // contribution — it sits on both lines and never creates a profit gap.
            var marketValue = 0m;
            var bankingContribution = 0m;
            foreach (var (accountId, list) in byAccount)
            {
                var latest = LatestOnOrBefore(list, d);
                if (latest is null) continue;
                marketValue += latest.ValueThb;
                if (banking.Contains(accountId)) bankingContribution += latest.ValueThb;
            }

            // Net contribution: cumulative signed flows up to and including d, plus
            // banking balances. Never clamped — it is legitimately negative once more
            // is withdrawn than was ever put in.
            var netContribution = bankingContribution;
            foreach (var f in flows)
            {
                if (f.OccurredOn <= d) netContribution += f.Delta;
                else break;
            }

            points.Add(new ChartPoint(d, marketValue, netContribution));
        }

        return points;
    }

    private static Snapshot? LatestOnOrBefore(List<Snapshot> ordered, DateOnly date)
    {
        Snapshot? found = null;
        foreach (var s in ordered)
        {
            if (s.AsOfDate <= date) found = s;
            else break;
        }
        return found;
    }
}
