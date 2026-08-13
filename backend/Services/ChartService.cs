using Api.Contracts;
using Api.Data;
using Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public enum ChartScope { NetWorth, Investment }

public interface IChartService
{
    Task<ChartResponse> GetChartAsync(ChartScope scope, int? accountId, DateOnly? from, DateOnly? to);
}

public class ChartService(AppDbContext db) : IChartService
{
    public async Task<ChartResponse> GetChartAsync(ChartScope scope, int? accountId, DateOnly? from, DateOnly? to)
    {
        // Which accounts define the view boundary.
        HashSet<int> inScope;
        if (accountId is int id)
        {
            inScope = [id]; // single-account drill-down
        }
        else
        {
            var q = db.Accounts.AsQueryable();
            if (scope == ChartScope.Investment)
                q = q.Where(a => a.Scope == Scope.Investment);
            inScope = (await q.Select(a => a.Id).ToListAsync()).ToHashSet();
        }

        // Banking accounts count as pure capital (net contribution), so the chart
        // treats their balance as sitting on both lines.
        var bankingAccountIds = (await db.Accounts
                .Where(a => inScope.Contains(a.Id) && a.Scope == Scope.Banking)
                .Select(a => a.Id)
                .ToListAsync())
            .ToHashSet();

        var snapshots = await db.Snapshots
            .Where(s => inScope.Contains(s.AccountId))
            .ToListAsync();

        // Include flows whose counter account is in scope even if the account
        // itself is not — that is how a transfer recorded on the outside account
        // still crosses the boundary of this view.
        var cashFlows = await db.CashFlows
            .Where(c => inScope.Contains(c.AccountId) ||
                        (c.CounterAccountId != null && inScope.Contains(c.CounterAccountId.Value)))
            .ToListAsync();

        var points = ChartCalculator.Build(inScope, snapshots, cashFlows, from, to, bankingAccountIds);
        return new ChartResponse(points);
    }
}
