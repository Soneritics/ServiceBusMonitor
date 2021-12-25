using Microsoft.AspNetCore.Mvc;
using ServiceBusMonitor.Api;

namespace ServiceBusMonitor.Areas.Api.Controllers;

public abstract class ApiControllerBase : ControllerBase
{
    protected readonly IApiCollection ApiCollection;

    protected ApiControllerBase(IApiCollection apiCollection)
    {
        ApiCollection = apiCollection;
    }
}