using Microsoft.AspNetCore.Mvc;
using ServiceBusMonitor.Api;

namespace ServiceBusMonitor.Areas.Api.Controllers;

[Area("Api")]
[Route("api/[controller]/[action]")]
[ApiController]
public class ApplicationInsightsController : ApiControllerBase
{
    public ApplicationInsightsController(IApiCollection apiCollection)
        : base(apiCollection)
    {
    }

    [HttpGet]
    public async Task<JsonResult> GetExceptionLogs(string busName, DateTime dateTime)
    {
        var logs = await ApiCollection
            .GetApplicationInsightsApi(busName)
            .GetExceptionsAroundAsync(dateTime);

        return new JsonResult(logs);
    }
}