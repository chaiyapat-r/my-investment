using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/history")]
[Authorize]
public class HistoryController(IHistoryService history) : ControllerBase
{
    // GET /api/history?accountId=&type=all|snapshot|flow&page=1&pageSize=15
    // Combined snapshot + cash-flow ledger, newest first, paginated.
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int? accountId = null,
        [FromQuery] string type = "all",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 15)
    {
        var t = type?.ToLowerInvariant() switch
        {
            "snapshot" => "snapshot",
            "flow" => "flow",
            _ => "all",
        };
        return Ok(await history.GetAsync(accountId, t, page, pageSize));
    }
}
