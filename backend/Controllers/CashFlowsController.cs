using Api.Contracts;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/cashflows")]
[Authorize]
public class CashFlowsController(ICashFlowService cashFlows) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetForAccount([FromQuery] int accountId) =>
        Ok(await cashFlows.GetForAccountAsync(accountId));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) =>
        await cashFlows.GetAsync(id) is { } flow ? Ok(flow) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CashFlowCreateRequest req)
    {
        var flow = await cashFlows.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = flow.Id }, flow);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] CashFlowUpdateRequest req) =>
        await cashFlows.UpdateAsync(id, req) is { } flow ? Ok(flow) : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await cashFlows.DeleteAsync(id) ? NoContent() : NotFound();
}
