namespace Api.Domain;

/// <summary>
/// A staged entry plan for one stock. Forward-looking, independent of the
/// tracking side. Denominated per-plan in Currency (default USD, THB supported).
/// </summary>
public class EntryPlan
{
    public int Id { get; set; }

    public int? AccountId { get; set; }
    public Account? Account { get; set; }

    public required string Symbol { get; set; }
    public Currency Currency { get; set; } = Currency.USD;
    public DateOnly PlanDate { get; set; }
    public PlanStatus Status { get; set; } = PlanStatus.Active;

    public List<PlanTranche> Tranches { get; set; } = [];
}
