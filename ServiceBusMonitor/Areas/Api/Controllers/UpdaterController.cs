using Microsoft.AspNetCore.Mvc;
using ServiceBusMonitor.Api;

namespace ServiceBusMonitor.Areas.Api.Controllers
{
    [Area("Api")]
    [Route("api/[controller]")]
    [ApiController]
    public class UpdaterController : ApiControllerBase
    {
        private static DateTime _lastUpdate = DateTime.Now;

        public UpdaterController(IApiCollection apiCollection)
            : base(apiCollection)
        {
        }

        [HttpGet]
        public async Task<string> Update()
        {
            // Prevent too many simultaneous updates
            var canUpdate = DateTime.Now > _lastUpdate.AddSeconds(60);

            if (canUpdate)
            {
                foreach (var sbName in ApiCollection.GetServiceBusApiNames())
                {
                    var sb = ApiCollection.GetServiceBusApi(sbName);

                    await sb.ReloadQueuesAsync();
                    await sb.ReloadTopicsAsync();
                }

                _lastUpdate = DateTime.Now;
            }

            return _lastUpdate.ToShortTimeString();
        }
    }
}
