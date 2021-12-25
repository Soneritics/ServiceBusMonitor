using Microsoft.AspNetCore.Mvc;
using ServiceBusMonitor.Api;
using ServiceBusMonitor.Api.Apis;
using ServiceBusMonitor.Models.Configuration;

namespace ServiceBusMonitor.Areas.Api.Controllers
{
    [Area("Api")]
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationLoaderController : ApiControllerBase
    {
        private static string _status = "Warming up";
        private readonly IConfiguration _configuration;

        public ApplicationLoaderController(
            IApiCollection apiCollection,
            IConfiguration configuration)
            : base(apiCollection)
        {
            _configuration = configuration;
        }

        [HttpGet("Status")]
        public string Status()
        {
            return _status;
        }

        [HttpGet]
        public async Task<string> Get()
        {
            _status = "Loading Application Settings";
            var apiConfiguration = new AppConfiguration();
            _configuration.GetSection(AppConfiguration.OptionsName).Bind(apiConfiguration.Configurations);

            _status = "Validating Application Settings";
            // todo: validate application settings
            await Task.Delay(1000);

            _status = "Registering Services";
            await Task.Delay(1000);

            foreach (var connection in apiConfiguration.Configurations)
            {
                _status = $"Registering Services: {connection.Name}";
                
                ApiCollection.RegisterApi(
                    connection.Name,
                    new ServiceBusApi(connection.BusConfiguration));

                ApiCollection.RegisterApi(
                    connection.Name,
                    new ApplicationInsightsApi(connection.ApplicationInsightsConfiguration));

                await Task.Delay(500);
            }
            
            _status = "Fetching queues, topics and subscriptions from ASBs";
            foreach (var sbName in ApiCollection.GetServiceBusApiNames())
            {
                var sb = ApiCollection.GetServiceBusApi(sbName);

                _status = $"Fetching queues from {sbName}";
                await sb.ReloadQueuesAsync();

                _status = $"Fetching topics from {sbName}";
                await sb.ReloadTopicsAsync();
            }

            _status = "Ready to go :-)";
            return _status;
        }
    }
}
