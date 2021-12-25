using Microsoft.AspNetCore.Mvc;

namespace ServiceBusMonitor.Areas.Client.Controllers
{
    [Area("Client")]
    public class LoaderController : Controller
    {
        [HttpGet]
        [Route("/")]
        public IActionResult Index()
        {
            return View();
        }
    }
}