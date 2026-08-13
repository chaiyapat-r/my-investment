using Api.Domain;

namespace Api.Contracts;

// A unified ledger row: either a valuation snapshot or a cash flow. The raw
// entity is carried through so the frontend's existing edit modals can reuse it.
public record HistoryItem(
    string Kind,        // "snapshot" | "flow"
    int AccountId,
    DateOnly Date,
    Snapshot? Snapshot,
    CashFlow? Flow);

public record HistoryResponse(
    IReadOnlyList<HistoryItem> Items, int Page, int PageSize, int Total, int TotalPages);
