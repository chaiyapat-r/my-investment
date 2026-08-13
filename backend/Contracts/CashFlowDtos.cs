using Api.Domain;

namespace Api.Contracts;

public record CashFlowCreateRequest(
    int AccountId, DateOnly OccurredOn, Direction Direction, decimal Amount,
    Currency Currency, decimal FxRateUsed, int? CounterAccountId, string? Note);

public record CashFlowUpdateRequest(
    DateOnly OccurredOn, Direction Direction, decimal Amount,
    Currency Currency, decimal FxRateUsed, int? CounterAccountId, string? Note);
