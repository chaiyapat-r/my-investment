using Api.Contracts;
using Api.Data;
using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public interface IAccountService
{
    Task EnsureSeededAsync();
    Task<List<Account>> GetAllAsync(bool includeArchived);
    Task<Account?> GetAsync(int id);
    Task<Account> CreateAsync(AccountCreateRequest req);
    Task<Account?> UpdateAsync(int id, AccountUpdateRequest req);
    Task<bool> ArchiveAsync(int id);
}

public class AccountService(AppDbContext db) : IAccountService
{
    public async Task EnsureSeededAsync()
    {
        if (await db.Accounts.AnyAsync())
            return;

        db.Accounts.AddRange(
            new Account { Name = "เงินสดธนาคาร", Currency = Currency.THB, Kind = AccountKind.Cash, Scope = Scope.Banking, DisplayOrder = 1 },
            new Account { Name = "FX Day Trading", Currency = Currency.USD, Kind = AccountKind.FX, Scope = Scope.Investment, DisplayOrder = 2 },
            new Account { Name = "Webull", Currency = Currency.USD, Kind = AccountKind.Equity, Scope = Scope.Investment, DisplayOrder = 3 },
            new Account { Name = "BTC (Bitkub)", Currency = Currency.THB, Kind = AccountKind.Crypto, Scope = Scope.Investment, DisplayOrder = 4 });
        await db.SaveChangesAsync();
    }

    public Task<List<Account>> GetAllAsync(bool includeArchived) =>
        db.Accounts
            .Where(a => includeArchived || !a.IsArchived)
            .OrderBy(a => a.DisplayOrder)
            .ToListAsync();

    public Task<Account?> GetAsync(int id) =>
        db.Accounts.FirstOrDefaultAsync(a => a.Id == id);

    public async Task<Account> CreateAsync(AccountCreateRequest req)
    {
        var account = new Account
        {
            Name = req.Name,
            Currency = req.Currency,
            Kind = req.Kind,
            Scope = req.Scope,
            Color = req.Color,
            DisplayOrder = req.DisplayOrder,
        };
        db.Accounts.Add(account);
        await db.SaveChangesAsync();
        return account;
    }

    public async Task<Account?> UpdateAsync(int id, AccountUpdateRequest req)
    {
        var account = await db.Accounts.FirstOrDefaultAsync(a => a.Id == id);
        if (account is null)
            return null;

        account.Name = req.Name;
        account.Currency = req.Currency;
        account.Kind = req.Kind;
        account.Scope = req.Scope;
        account.Color = req.Color;
        account.DisplayOrder = req.DisplayOrder;
        account.IsArchived = req.IsArchived;
        await db.SaveChangesAsync();
        return account;
    }

    // Soft-delete: accounts hold history, so archive instead of removing.
    public async Task<bool> ArchiveAsync(int id)
    {
        var account = await db.Accounts.FirstOrDefaultAsync(a => a.Id == id);
        if (account is null)
            return false;

        account.IsArchived = true;
        await db.SaveChangesAsync();
        return true;
    }
}
