using ServiceBusMonitor.Api.Exceptions;

namespace ServiceBusMonitor.Api.Apis.Configuration;

public class ApplicationInsightsConfiguration
{
    public string AppId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;

    public void Validate()
    {
        if (string.IsNullOrEmpty(AppId))
        {
            throw new InvalidConfigurationException("AI AppId can not be empty.");
        }

        if (string.IsNullOrEmpty(ApiKey))
        {
            throw new InvalidConfigurationException("AI ApiKey can not be empty.");
        }
    }
}