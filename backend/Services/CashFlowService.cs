using Api.Contracts;
using Api.Data;
using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public interface ICashFlowService
{
    Task<List<CashFlow>> GetForAccountAsync(int accountId);
    Task<CashFlow?> GetAsync(int id);
    Task<CashFlow> CreateAsync(CashFlowCreateRequest req);
    Task<CashFlow?> UpdateAsync(int id, CashFlowUpdateRequest req);
    Task<bool> DeleteAsync(int id);
}

public class CashFlowService(AppDbContext db) : ICashFlowService
{
    // THB flows use rate 1; USD flows convert at the supplied rate.
    private static (decimal fxRate, decimal amountThb) Normalize(Currency currency, decimal amount, decimal fxRateUsed)
    {
        var fxRate = currency == Currency.THB ? 1m : fxRateUsed;
        return (fxRate, amount * fxRate);
    }

    public Task<List<CashFlow>> GetForAccountAsync(int accountId) =>
        db.CashFlows
            .Where(c => c.AccountId == accountId)
            .OrderBy(c => c.OccurredOn)
            .ToListAsync();

    public Task<CashFlow?> GetAsync(int id) =>
        db.CashFlows.FirstOrDefaultAsync(c => c.Id == id);

    public async Task<CashFlow> CreateAsync(CashFlowCreateRequest req)
    {
        var (fxRate, amountThb) = Normalize(req.Currency, req.Amount, req.FxRateUsed);
        var flow = new CashFlow
        {
            AccountId = req.AccountId,
            OccurredOn = req.OccurredOn,
            Direction = req.Direction,
            Amount = req.Amount,
            Currency = req.Currency,
            FxRateUsed = fxRate,
            AmountThb = amountThb,
            CounterAccountId = req.CounterAccountId,
            Note = req.Note,
        };
        db.CashFlows.Add(flow);
        await db.SaveChangesAsync();
        return flow;
    }

    public async Task<CashFlow?> UpdateAsync(int id, CashFlowUpdateRequest req)
    {
        var flow = await db.CashFlows.FirstOrDefaultAsync(c => c.Id == id);
        if (flow is null)
            return null;

        var (fxRate, amountThb) = Normalize(req.Currency, req.Amount, req.FxRateUsed);
        flow.OccurredOn = req.OccurredOn;
        flow.Direction = req.Direction;
        flow.Amount = req.Amount;
        flow.Currency = req.Currency;
        flow.FxRateUsed = fxRate;
        flow.AmountThb = amountThb;
        flow.CounterAccountId = req.CounterAccountId;
        flow.Note = req.Note;
        await db.SaveChangesAsync();
        return flow;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var flow = await db.CashFlows.FirstOrDefaultAsync(c => c.Id == id);
        if (flow is null)
            return false;

        db.CashFlows.Remove(flow);
        await db.SaveChangesAsync();
        return true;
    }
}
