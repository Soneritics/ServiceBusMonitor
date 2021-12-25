using Microsoft.AspNetCore.Mvc;
using ServiceBusMonitor.Api;
using ServiceBusMonitor.Areas.Client.Models;

namespace ServiceBusMonitor.Areas.Client.Controllers;

[Area("Client")]
public class MonitorController : Controller
{
    private readonly ILogger<MonitorController> _logger;
    private readonly IApiCollection _apiCollection;

    public MonitorController(
        ILogger<MonitorController> logger,
        IApiCollection apiCollection)
    {
        _logger = logger;
        _apiCollection = apiCollection;
    }

    [HttpGet]
    public IActionResult Index(string bus)
    {
        return View(new MonitorViewModel()
        {
            ActiveBus = bus,
            ServiceBusNames = _apiCollection.GetServiceBusApiNames()
        });
    }

    [HttpGet]
    [Route("Monitor")]
    public IActionResult RedirectToTheFirstBus()
    {
        return new RedirectToActionResult(
            nameof(Index),
            "Monitor",
            new {bus = _apiCollection.GetServiceBusApiNames().First()});
    }
}