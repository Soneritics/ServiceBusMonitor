namespace ServiceBusMonitor.Models.Configuration;

public class AppConfiguration
{
    public const string OptionsName = nameof(AppConfiguration);
    public IEnumerable<AppConfigurationValue> Configurations { get; set; } = new List<AppConfigurationValue>();
}