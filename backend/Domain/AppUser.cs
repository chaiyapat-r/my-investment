namespace Api.Domain;

/// <summary>Single-user access gate. Owns no domain data.</summary>
public class AppUser
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastLoginAt { get; set; }
}
