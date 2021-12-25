using ServiceBusMonitor.Api.Apis.Interfaces;

namespace ServiceBusMonitor.Api;

public interface IApiCollection
{
    void RegisterApi(string name, IServiceBusApi api);

    void RegisterApi(string name, IApplicationInsightsApi api);

    IEnumerable<string> GetServiceBusApiNames();

    IServiceBusApi GetServiceBusApi(string name);

    IApplicationInsightsApi GetApplicationInsightsApi(string name);
}