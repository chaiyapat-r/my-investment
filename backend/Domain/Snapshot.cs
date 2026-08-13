namespace Api.Domain;

/// <summary>
/// A photograph of an account's total value on a date. Drives the market-value
/// line. ValueThb is the source of truth for charting.
/// </summary>
public class Snapshot
{
    public int Id { get; set; }

    public int AccountId { get; set; }
    public Account? Account { get; set; }

    public DateOnly AsOfDate { get; set; }
    public decimal ValueThb { get; set; }
    public decimal NativeAmount { get; set; }
    public Currency NativeCurrency { get; set; }
    public decimal FxRateUsed { get; set; }
    public string? Note { get; set; }
}
