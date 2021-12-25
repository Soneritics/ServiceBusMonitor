namespace ServiceBusMonitor.Api.Models;

public class ServiceBusTopicSubscription
{
    public string Name { get; set; } = string.Empty;
    public long ActiveMessages { get; set; } = 0;
    public long DeadLetteredMessages { get; set; } = 0;
}