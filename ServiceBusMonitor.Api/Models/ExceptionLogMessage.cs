namespace ServiceBusMonitor.Api.Models;

public class ExceptionLogMessage
{
    public DateTime Timestamp { get; set; } = DateTime.Now;
    public string Type { get; set; } = string.Empty;
    public string OperationId { get; set; } = string.Empty;
    public string OperationName { get; set; } = string.Empty;
    public string CloudRoleName { get; set; } = string.Empty;
    public string OuterMessage { get; set; } = string.Empty;
    public string InnerMostMessage { get; set; } = string.Empty;
}