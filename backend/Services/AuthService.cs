using Api.Data;
using Api.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class AuthService(
    AppDbContext db,
    IPasswordHasher<AppUser> hasher,
    IConfiguration config,
    ILogger<AuthService> logger) : IAuthService
{
    public async Task<AppUser?> VerifyCredentialsAsync(string username, string password)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Username == username);
        if (user is null)
            return null;

        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, password);
        if (result == PasswordVerificationResult.Failed)
            return null;

        // Transparently upgrade the stored hash if the algorithm parameters moved on.
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
            user.PasswordHash = hasher.HashPassword(user, password);

        user.LastLoginAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return user;
    }

    public async Task EnsureSeedUserAsync()
    {
        if (await db.Users.AnyAsync())
            return;

        var username = config["Auth:Username"];
        var passwordHash = config["Auth:PasswordHash"];
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(passwordHash))
        {
            logger.LogWarning(
                "No Auth:Username / Auth:PasswordHash configured — user not seeded. " +
                "Login will not work until a user exists.");
            return;
        }

        db.Users.Add(new AppUser
        {
            Username = username,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync();
        logger.LogInformation("Seeded initial user '{Username}'.", username);
    }

    public string HashPassword(string password) =>
        hasher.HashPassword(new AppUser { Username = "", PasswordHash = "" }, password);
}
