using Api.Domain;

namespace Api.Contracts;

public record EntryPlanCreateRequest(
    string Symbol, Currency Currency, DateOnly PlanDate, int? AccountId);

public record EntryPlanUpdateRequest(
    string Symbol, Currency Currency, DateOnly PlanDate, PlanStatus Status, int? AccountId);

public record TrancheCreateRequest(
    decimal Price, decimal Budget, decimal Quantity, bool Filled,
    decimal? SlPrice, decimal? TpPrice);

public record TrancheUpdateRequest(
    decimal Price, decimal Budget, decimal Quantity, bool Filled,
    decimal? SlPrice, decimal? TpPrice);
