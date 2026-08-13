using Api.Domain;

namespace Api.Contracts;

public record AccountCreateRequest(
    string Name, Currency Currency, AccountKind Kind, Scope Scope, int DisplayOrder,
    string? Color = null);

public record AccountUpdateRequest(
    string Name, Currency Currency, AccountKind Kind, Scope Scope,
    int DisplayOrder, bool IsArchived, string? Color = null);
