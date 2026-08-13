namespace Api.Domain;

/// <summary>The container every snapshot, cash flow, and transaction hangs off.</summary>
public class Account
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public Currency Currency { get; set; }
    public AccountKind Kind { get; set; }
    public Scope Scope { get; set; }
    public string? Color { get; set; } // hex accent chosen by the user; null = derive from Kind
    public int DisplayOrder { get; set; }
    public bool IsArchived { get; set; }
}
