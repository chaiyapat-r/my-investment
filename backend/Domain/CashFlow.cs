namespace Api.Domain;

/// <summary>
/// Money crossing a boundary. Drives the net-contribution line. A non-null
/// CounterAccountId marks an internal transfer between the user's own accounts.
/// OccurredOn is the real date (never rounded to the snapshot week) — required
/// for time-weighted return.
/// </summary>
public class CashFlow
{
    public int Id { get; set; }

    public int AccountId { get; set; }
    public Account? Account { get; set; }

    public DateOnly OccurredOn { get; set; }
    public Direction Direction { get; set; }
    public decimal Amount { get; set; }
    public Currency Currency { get; set; }
    public decimal FxRateUsed { get; set; }
    public decimal AmountThb { get; set; }

    public int? CounterAccountId { get; set; }
    public Account? CounterAccount { get; set; }

    public string? Note { get; set; }
}
