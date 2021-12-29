namespace ServiceBusMonitor.Areas.Api.Exceptions;

public class CouldNotBindConfigurationException : Exception
{
    public CouldNotBindConfigurationException(Exception? innerException)
        : base(ExceptionMessage, innerException)
    {
    }

    public override string Message => ExceptionMessage;

    private static string ExceptionMessage =>
        "Cannot bind configuration from the IConfiguration. " +
        "Please refer to the example file included in the project.";
}