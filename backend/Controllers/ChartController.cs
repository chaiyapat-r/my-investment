using Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/chart")]
[Authorize]
public class ChartController(IChartService chart) : ControllerBase
{
    // GET /api/chart?scope=networth|investment&accountId=&from=&to=
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string scope = "networth",
        [FromQuery] int? accountId = null,
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null)
    {
        var chartScope = scope?.ToLowerInvariant() switch
        {
            "investment" => ChartScope.Investment,
            "networth" => ChartScope.NetWorth,
            _ => (ChartScope?)null,
        };
        if (chartScope is null)
            return BadRequest(new { error = "scope must be 'networth' or 'investment'." });

        return Ok(await chart.GetChartAsync(chartScope.Value, accountId, from, to));
    }
}
