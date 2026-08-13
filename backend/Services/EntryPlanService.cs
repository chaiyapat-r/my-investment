using Api.Contracts;
using Api.Data;
using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public interface IEntryPlanService
{
    Task<List<EntryPlan>> GetAllAsync();
    Task<EntryPlan?> GetAsync(int id);
    Task<EntryPlan> CreateAsync(EntryPlanCreateRequest req);
    Task<EntryPlan?> UpdateAsync(int id, EntryPlanUpdateRequest req);
    Task<bool> DeleteAsync(int id);

    Task<PlanTranche?> AddTrancheAsync(int planId, TrancheCreateRequest req);
    Task<PlanTranche?> UpdateTrancheAsync(int planId, int trancheId, TrancheUpdateRequest req);
    Task<bool> DeleteTrancheAsync(int planId, int trancheId);
}

public class EntryPlanService(AppDbContext db) : IEntryPlanService
{
    // Tranches sorted price-descending to match the ladder display.
    public Task<List<EntryPlan>> GetAllAsync() =>
        db.EntryPlans
            .Include(p => p.Tranches.OrderByDescending(t => t.Price))
            .OrderByDescending(p => p.PlanDate)
            .ThenByDescending(p => p.Id) // newest plan first on same date
            .ToListAsync();

    public Task<EntryPlan?> GetAsync(int id) =>
        db.EntryPlans
            .Include(p => p.Tranches.OrderByDescending(t => t.Price))
            .FirstOrDefaultAsync(p => p.Id == id);

    public async Task<EntryPlan> CreateAsync(EntryPlanCreateRequest req)
    {
        var plan = new EntryPlan
        {
            Symbol = req.Symbol,
            Currency = req.Currency,
            PlanDate = req.PlanDate,
            AccountId = req.AccountId,
            Status = PlanStatus.Active,
        };
        db.EntryPlans.Add(plan);
        await db.SaveChangesAsync();
        return plan;
    }

    public async Task<EntryPlan?> UpdateAsync(int id, EntryPlanUpdateRequest req)
    {
        var plan = await db.EntryPlans.FirstOrDefaultAsync(p => p.Id == id);
        if (plan is null)
            return null;

        plan.Symbol = req.Symbol;
        plan.Currency = req.Currency;
        plan.PlanDate = req.PlanDate;
        plan.Status = req.Status;
        plan.AccountId = req.AccountId;
        await db.SaveChangesAsync();
        return plan;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var plan = await db.EntryPlans.FirstOrDefaultAsync(p => p.Id == id);
        if (plan is null)
            return false;

        db.EntryPlans.Remove(plan); // tranches cascade
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<PlanTranche?> AddTrancheAsync(int planId, TrancheCreateRequest req)
    {
        if (!await db.EntryPlans.AnyAsync(p => p.Id == planId))
            return null;

        var tranche = new PlanTranche
        {
            PlanId = planId,
            Price = req.Price,
            Budget = req.Budget,
            Quantity = req.Quantity,
            Filled = req.Filled,
            SlPrice = req.SlPrice,
            TpPrice = req.TpPrice,
        };
        db.PlanTranches.Add(tranche);
        await db.SaveChangesAsync();
        return tranche;
    }

    public async Task<PlanTranche?> UpdateTrancheAsync(int planId, int trancheId, TrancheUpdateRequest req)
    {
        var tranche = await db.PlanTranches
            .FirstOrDefaultAsync(t => t.Id == trancheId && t.PlanId == planId);
        if (tranche is null)
            return null;

        tranche.Price = req.Price;
        tranche.Budget = req.Budget;
        tranche.Quantity = req.Quantity;
        tranche.Filled = req.Filled;
        tranche.SlPrice = req.SlPrice;
        tranche.TpPrice = req.TpPrice;
        await db.SaveChangesAsync();
        return tranche;
    }

    public async Task<bool> DeleteTrancheAsync(int planId, int trancheId)
    {
        var tranche = await db.PlanTranches
            .FirstOrDefaultAsync(t => t.Id == trancheId && t.PlanId == planId);
        if (tranche is null)
            return false;

        db.PlanTranches.Remove(tranche);
        await db.SaveChangesAsync();
        return true;
    }
}
