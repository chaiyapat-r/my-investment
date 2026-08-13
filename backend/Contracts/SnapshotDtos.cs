using Api.Domain;

namespace Api.Contracts;

public record SnapshotCreateRequest(
    int AccountId, DateOnly AsOfDate, decimal ValueThb, decimal NativeAmount,
    Currency NativeCurrency, decimal FxRateUsed, string? Note);

public record SnapshotUpdateRequest(
    DateOnly AsOfDate, decimal ValueThb, decimal NativeAmount,
    Currency NativeCurrency, decimal FxRateUsed, string? Note);

// Weekly bulk entry — one shared FX rate for every USD account at once.
public record BulkSnapshotItem(
    int AccountId, decimal NativeAmount, Currency NativeCurrency,
    decimal? ValueThbOverride, string? Note);

public record BulkSnapshotRequest(
    DateOnly AsOfDate, decimal FxRate, List<BulkSnapshotItem> Items);
