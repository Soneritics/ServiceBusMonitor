using ServiceBusMonitor.Api.Exceptions;

namespace ServiceBusMonitor.Api.Apis.Configuration;

public class BusConfiguration
{
    public string ConnectionString { get; set; } = string.Empty;

    public void Validate()
    {
        if (string.IsNullOrEmpty(ConnectionString))
        {
            throw new InvalidConfigurationException("Service bus connection string can not be empty.");
        }
    }
}