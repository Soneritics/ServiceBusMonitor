namespace ServiceBusMonitor.Api.Exceptions;

public class InvalidConfigurationException : Exception
{
    public InvalidConfigurationException(
        string? message) : base(message)
    {
    }
}