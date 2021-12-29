using ServiceBusMonitor.Areas.Api.Exceptions;

namespace ServiceBusMonitor.Models.Configuration;

public class AppConfiguration
{
    public const string OptionsName = nameof(AppConfiguration);
    public IEnumerable<AppConfigurationValue> Configurations { get; set; } = new List<AppConfigurationValue>();

    public void Validate()
    {
        if (!Configurations.Any())
        {
            throw new NoBusConfigurationsFoundException();
        }

        foreach (var configuration in Configurations)
        {
            configuration.Validate();
        }
    }
}