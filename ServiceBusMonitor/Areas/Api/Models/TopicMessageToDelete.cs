namespace ServiceBusMonitor.Areas.Api.Models;

public class TopicMessageToDelete
{
    public string BusName { get; set; }
    public string TopicName { get; set; }
    public string SubscriptionName { get; set; }
    public string MessageId { get; set; }
}