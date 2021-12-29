using ServiceBusMonitor.Api.Apis.Configuration;
using ServiceBusMonitor.Api.Exceptions;
using ServiceBusMonitor.Areas.Api.Exceptions;

namespace ServiceBusMonitor.Models.Configuration;

public class AppConfigurationValue
{
    public string Name { get; set; } = string.Empty;
    public BusConfiguration? BusConfiguration { get; set; }
    public ApplicationInsightsConfiguration? ApplicationInsightsConfiguration { get; set; }

    public void Validate()
    {
        if (string.IsNullOrEmpty(Name))
        {
            throw new NoNameForAppConfigurationValueException();
        }

        if (BusConfiguration == default)
        {
            throw new NoActualBusConfigurationException(Name);
        }

        try
        {
            BusConfiguration.Validate();
            ApplicationInsightsConfiguration?.Validate();
        }
        catch (InvalidConfigurationException ex)
        {
            throw new InvalidConfigurationValueException(
                $"Configuration invalid for {Name}: {ex.Message}");
        }
    }
}