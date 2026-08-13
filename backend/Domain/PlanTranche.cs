namespace Api.Domain;

/// <summary>
/// One rung of an entry ladder. Budget is the primary input; Quantity is derived
/// (Budget / Price) but user-editable. Filled marks whether the rung was bought.
/// </summary>
public class PlanTranche
{
    public int Id { get; set; }

    public int PlanId { get; set; }
    public EntryPlan? Plan { get; set; }

    public decimal Price { get; set; }
    public decimal Budget { get; set; }
    public decimal Quantity { get; set; }
    public bool Filled { get; set; }

    // Optional risk levels for this rung. Loss/profit-if-hit are derived on the
    // client (qty × price distance) and not stored.
    public decimal? SlPrice { get; set; }
    public decimal? TpPrice { get; set; }
}
