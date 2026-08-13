using Api.Contracts;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/entry-plans")]
[Authorize]
public class EntryPlansController(IEntryPlanService plans) : ControllerBase
{
    // --- Plans ---

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await plans.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) =>
        await plans.GetAsync(id) is { } plan ? Ok(plan) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] EntryPlanCreateRequest req)
    {
        var plan = await plans.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = plan.Id }, plan);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] EntryPlanUpdateRequest req) =>
        await plans.UpdateAsync(id, req) is { } plan ? Ok(plan) : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await plans.DeleteAsync(id) ? NoContent() : NotFound();

    // --- Tranches (nested under a plan) ---

    [HttpPost("{planId:int}/tranches")]
    public async Task<IActionResult> AddTranche(int planId, [FromBody] TrancheCreateRequest req) =>
        await plans.AddTrancheAsync(planId, req) is { } tranche ? Ok(tranche) : NotFound();

    [HttpPut("{planId:int}/tranches/{trancheId:int}")]
    public async Task<IActionResult> UpdateTranche(int planId, int trancheId, [FromBody] TrancheUpdateRequest req) =>
        await plans.UpdateTrancheAsync(planId, trancheId, req) is { } tranche ? Ok(tranche) : NotFound();

    [HttpDelete("{planId:int}/tranches/{trancheId:int}")]
    public async Task<IActionResult> DeleteTranche(int planId, int trancheId) =>
        await plans.DeleteTrancheAsync(planId, trancheId) ? NoContent() : NotFound();
}
