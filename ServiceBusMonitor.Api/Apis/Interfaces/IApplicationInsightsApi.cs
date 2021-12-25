using ServiceBusMonitor.Api.Models;

namespace ServiceBusMonitor.Api.Apis.Interfaces;

public interface IApplicationInsightsApi
{
    Task<IEnumerable<ExceptionLogMessage>> GetExceptionsAroundAsync(DateTime dateTime);
}