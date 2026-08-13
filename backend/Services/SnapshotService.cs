using Api.Contracts;
using Api.Data;
using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public interface ISnapshotService
{
    Task<List<Snapshot>> GetForAccountAsync(int accountId);
    Task<Snapshot?> GetAsync(int id);
    Task<Snapshot> CreateAsync(SnapshotCreateRequest req);
    Task<Snapshot?> UpdateAsync(int id, SnapshotUpdateRequest req);
    Task<bool> DeleteAsync(int id);
    Task<List<Snapshot>> BulkUpsertAsync(BulkSnapshotRequest req);
}

public class SnapshotService(AppDbContext db) : ISnapshotService
{
    public Task<List<Snapshot>> GetForAccountAsync(int accountId) =>
        db.Snapshots
            .Where(s => s.AccountId == accountId)
            .OrderBy(s => s.AsOfDate)
            .ToListAsync();

    public Task<Snapshot?> GetAsync(int id) =>
        db.Snapshots.FirstOrDefaultAsync(s => s.Id == id);

    public async Task<Snapshot> CreateAsync(SnapshotCreateRequest req)
    {
        if (await db.Snapshots.AnyAsync(s => s.AccountId == req.AccountId && s.AsOfDate == req.AsOfDate))
            throw new ConflictException($"A snapshot for account {req.AccountId} on {req.AsOfDate} already exists.");

        var snapshot = new Snapshot
        {
            AccountId = req.AccountId,
            AsOfDate = req.AsOfDate,
            ValueThb = req.ValueThb,
            NativeAmount = req.NativeAmount,
            NativeCurrency = req.NativeCurrency,
            FxRateUsed = req.FxRateUsed,
            Note = req.Note,
        };
        db.Snapshots.Add(snapshot);
        await db.SaveChangesAsync();
        return snapshot;
    }

    public async Task<Snapshot?> UpdateAsync(int id, SnapshotUpdateRequest req)
    {
        var snapshot = await db.Snapshots.FirstOrDefaultAsync(s => s.Id == id);
        if (snapshot is null)
            return null;

        // Moving the date must not collide with another snapshot of the same account.
        if (snapshot.AsOfDate != req.AsOfDate &&
            await db.Snapshots.AnyAsync(s => s.AccountId == snapshot.AccountId && s.AsOfDate == req.AsOfDate))
            throw new ConflictException($"A snapshot for account {snapshot.AccountId} on {req.AsOfDate} already exists.");

        snapshot.AsOfDate = req.AsOfDate;
        snapshot.ValueThb = req.ValueThb;
        snapshot.NativeAmount = req.NativeAmount;
        snapshot.NativeCurrency = req.NativeCurrency;
        snapshot.FxRateUsed = req.FxRateUsed;
        snapshot.Note = req.Note;
        await db.SaveChangesAsync();
        return snapshot;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var snapshot = await db.Snapshots.FirstOrDefaultAsync(s => s.Id == id);
        if (snapshot is null)
            return false;

        db.Snapshots.Remove(snapshot);
        await db.SaveChangesAsync();
        return true;
    }

    // Weekly entry: every account's value for one date in a single request, with
    // one shared FX rate applied to USD accounts. Re-submitting the same week
    // updates the existing rows (upsert) rather than failing on the unique index.
    public async Task<List<Snapshot>> BulkUpsertAsync(BulkSnapshotRequest req)
    {
        var accountIds = req.Items.Select(i => i.AccountId).ToList();
        var existing = await db.Snapshots
            .Where(s => s.AsOfDate == req.AsOfDate && accountIds.Contains(s.AccountId))
            .ToListAsync();

        var result = new List<Snapshot>();
        foreach (var item in req.Items)
        {
            var fxRate = item.NativeCurrency == Currency.THB ? 1m : req.FxRate;
            var valueThb = item.ValueThbOverride ?? item.NativeAmount * fxRate;

            var snapshot = existing.FirstOrDefault(s => s.AccountId == item.AccountId);
            if (snapshot is null)
            {
                snapshot = new Snapshot { AccountId = item.AccountId, AsOfDate = req.AsOfDate };
                db.Snapshots.Add(snapshot);
            }

            snapshot.ValueThb = valueThb;
            snapshot.NativeAmount = item.NativeAmount;
            snapshot.NativeCurrency = item.NativeCurrency;
            snapshot.FxRateUsed = fxRate;
            snapshot.Note = item.Note;
            result.Add(snapshot);
        }

        await db.SaveChangesAsync();
        return result;
    }
}
