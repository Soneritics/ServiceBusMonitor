namespace ServiceBusMonitor.Areas.Api.Models;

public class QueueMessageModel
{
    public string BusName { get; set; }
    public string QueueName { get; set; }
    public string MessageId { get; set; }
}