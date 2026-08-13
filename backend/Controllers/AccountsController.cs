using Api.Contracts;
using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/accounts")]
[Authorize]
public class AccountsController(IAccountService accounts) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeArchived = false) =>
        Ok(await accounts.GetAllAsync(includeArchived));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) =>
        await accounts.GetAsync(id) is { } account ? Ok(account) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AccountCreateRequest req)
    {
        var account = await accounts.CreateAsync(req);
        return CreatedAtAction(nameof(Get), new { id = account.Id }, account);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] AccountUpdateRequest req) =>
        await accounts.UpdateAsync(id, req) is { } account ? Ok(account) : NotFound();

    // Soft-delete (archive).
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Archive(int id) =>
        await accounts.ArchiveAsync(id) ? NoContent() : NotFound();
}
