namespace ServiceBusMonitor.Areas.Api.Exceptions;

public class InvalidConfigurationValueException : Exception
{
    public InvalidConfigurationValueException(string? message)
        : base(message)
    {
    }
}