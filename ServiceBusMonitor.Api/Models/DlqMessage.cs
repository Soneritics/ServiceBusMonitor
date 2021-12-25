namespace ServiceBusMonitor.Api.Models;

public class DlqMessage
{
    public string Id { get; set; } = string.Empty;
    public DateTime Enqueued { get; set; } = DateTime.Now;
    public string Content { get; set; } = string.Empty;
}