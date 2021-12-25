using ServiceBusMonitor.Api.Apis.Interfaces;

namespace ServiceBusMonitor.Api;

public class ApiCollection : IApiCollection
{
    private Dictionary<string, IServiceBusApi> _serviceBusApis = new();
    private Dictionary<string, IApplicationInsightsApi> _applicationInsightsApis = new();

    public void RegisterApi(string name, IServiceBusApi api)
    {
        _serviceBusApis.Add(name, api);
    }

    public void RegisterApi(string name, IApplicationInsightsApi api)
    {
        _applicationInsightsApis.Add(name, api);
    }

    public IEnumerable<string> GetServiceBusApiNames()
    {
        return _serviceBusApis.Keys.ToList();
    }

    public IServiceBusApi GetServiceBusApi(string name)
    {
        return _serviceBusApis[name];
    }

    public IApplicationInsightsApi GetApplicationInsightsApi(string name)
    {
        return _applicationInsightsApis[name];
    }
}