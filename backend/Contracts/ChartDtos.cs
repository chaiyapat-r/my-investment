namespace Api.Contracts;

public record ChartPoint(DateOnly Date, decimal MarketValueThb, decimal NetContributionThb);

public record ChartResponse(IReadOnlyList<ChartPoint> Points);
