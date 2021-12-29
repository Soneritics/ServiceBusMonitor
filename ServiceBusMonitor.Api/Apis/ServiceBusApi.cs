using ServiceBusMonitor.Api.Apis.Configuration;
using ServiceBusMonitor.Api.Apis.Interfaces;

namespace ServiceBusMonitor.Api.Apis
{
    public partial class ServiceBusApi : IServiceBusApi
    {
        private readonly BusConfiguration _configuration;

        public ServiceBusApi(BusConfiguration configuration)
        {
            _configuration = configuration;
        }
    }
}