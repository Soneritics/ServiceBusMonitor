namespace ServiceBusMonitor.Areas.Api.Models;

public class TopicMessageModel
{
    public string BusName { get; set; }
    public string TopicName { get; set; }
    public string SubscriptionName { get; set; }
    public string MessageId { get; set; }
}