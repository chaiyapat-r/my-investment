using Api.Domain;

namespace Api.Services;

public interface IAuthService
{
    /// <summary>Returns the user when the password matches, otherwise null.</summary>
    Task<AppUser?> VerifyCredentialsAsync(string username, string password);

    /// <summary>Seeds the single user from configuration if none exists yet.</summary>
    Task EnsureSeedUserAsync();

    /// <summary>Hashes a plaintext password (used by the `hash` CLI helper).</summary>
    string HashPassword(string password);
}
