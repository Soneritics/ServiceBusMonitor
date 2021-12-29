namespace ServiceBusMonitor.Areas.Api.Exceptions;

public class NoActualBusConfigurationException : Exception
{
    public NoActualBusConfigurationException(string? message)
        : base(message)
    {
    }
}