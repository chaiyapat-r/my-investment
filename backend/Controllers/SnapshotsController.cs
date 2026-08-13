using Api.Contracts;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/snapshots")]
[Authorize]
public class SnapshotsController(ISnapshotService snapshots) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetForAccount([FromQuery] int accountId) =>
        Ok(await snapshots.GetForAccountAsync(accountId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) =>
        await snapshots.GetAsync(id) is { } snapshot ? Ok(snapshot) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SnapshotCreateRequest req)
    {
        var snapshot = await snapshots.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = snapshot.Id }, snapshot);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] SnapshotUpdateRequest req) =>
        await snapshots.UpdateAsync(id, req) is { } snapshot ? Ok(snapshot) : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await snapshots.DeleteAsync(id) ? NoContent() : NotFound();

    // Weekly bulk entry — all accounts for one date, one shared FX rate.
    [HttpPost("bulk")]
    public async Task<IActionResult> Bulk([FromBody] BulkSnapshotRequest req) =>
        Ok(await snapshots.BulkUpsertAsync(req));
}
