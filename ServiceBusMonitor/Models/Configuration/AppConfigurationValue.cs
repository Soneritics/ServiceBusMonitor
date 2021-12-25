using ServiceBusMonitor.Api.Apis.Configuration;

namespace ServiceBusMonitor.Models.Configuration;

public class AppConfigurationValue
{
    public string Name { get; set; } = string.Empty;
    public BusConfiguration BusConfiguration { get; set; }
    public ApplicationInsightsConfiguration ApplicationInsightsConfiguration { get; set; }
}