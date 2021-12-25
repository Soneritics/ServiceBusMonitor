namespace ServiceBusMonitor.Api.Models;

public class ServiceBusTopic
{
    public string Name { get; set; } = string.Empty;
    public IEnumerable<ServiceBusTopicSubscription>? Subscriptions { get; set; }
}