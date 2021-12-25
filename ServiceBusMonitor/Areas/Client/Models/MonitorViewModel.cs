namespace ServiceBusMonitor.Areas.Client.Models;

public class MonitorViewModel
{
    public IEnumerable<string> ServiceBusNames { get; set; }

    public string ActiveBus { get; set; } = string.Empty;
}