namespace ServiceBusMonitor.Areas.Api.Models;

public class QueueMessageToDelete
{
    public string BusName { get; set; }
    public string QueueName { get; set; }
    public string MessageId { get; set; }
}