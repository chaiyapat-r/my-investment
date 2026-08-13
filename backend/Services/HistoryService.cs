using Api.Contracts;
using Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public interface IHistoryService
{
    Task<HistoryResponse> GetAsync(int? accountId, string type, int page, int pageSize);
}

public class HistoryService(AppDbContext db) : IHistoryService
{
    // Merges snapshots and cash flows into one date-descending feed, then pages
    // it. Loading rows into memory is deliberate: this is a single-user app whose
    // ledger is at most a few hundred rows, and two heterogeneous sources can't be
    // paged in a single SQL query without a union view.
    public async Task<HistoryResponse> GetAsync(int? accountId, string type, int page, int pageSize)
    {
        pageSize = Math.Clamp(pageSize, 1, 100);

        var items = new List<HistoryItem>();

        if (type != "flow")
        {
            var q = db.Snapshots.AsQueryable();
            if (accountId is int aid) q = q.Where(s => s.AccountId == aid);
            items.AddRange((await q.ToListAsync())
                .Select(s => new HistoryItem("snapshot", s.AccountId, s.AsOfDate, s, null)));
        }

        if (type != "snapshot")
        {
            var q = db.CashFlows.AsQueryable();
            if (accountId is int aid) q = q.Where(c => c.AccountId == aid);
            items.AddRange((await q.ToListAsync())
                .Select(c => new HistoryItem("flow", c.AccountId, c.OccurredOn, null, c)));
        }

        // Newest first; break same-date ties by id so paging is stable.
        var ordered = items
            .OrderByDescending(i => i.Date)
            .ThenByDescending(i => i.Kind == "flow" ? i.Flow!.Id : i.Snapshot!.Id)
            .ToList();

        var total = ordered.Count;
        var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)pageSize));
        page = Math.Clamp(page, 1, totalPages);
        var pageItems = ordered.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        return new HistoryResponse(pageItems, page, pageSize, total, totalPages);
    }
}
