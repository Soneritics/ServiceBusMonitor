namespace ServiceBusMonitor.Areas.Api.Exceptions;

public class InvalidServiceBusConnectionStringException : Exception
{
    public InvalidServiceBusConnectionStringException(string? message, Exception? innerException)
        : base(message, innerException)
    {
    }
}