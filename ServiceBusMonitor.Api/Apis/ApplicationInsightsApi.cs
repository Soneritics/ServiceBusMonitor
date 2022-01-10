using Microsoft.Azure.ApplicationInsights.Query;
using ServiceBusMonitor.Api.Apis.Configuration;
using ServiceBusMonitor.Api.Apis.Interfaces;
using ServiceBusMonitor.Api.Models;

namespace ServiceBusMonitor.Api.Apis;

public class ApplicationInsightsApi : IApplicationInsightsApi
{
    private readonly ApplicationInsightsDataClient _client;
    private readonly string _appId;

    public ApplicationInsightsApi(ApplicationInsightsConfiguration configuration)
    {
        var cred = new ApiKeyClientCredentials(configuration.ApiKey);

        _client = new ApplicationInsightsDataClient(cred);
        _client.BaseUri = new Uri("https://api.applicationinsights.io/v1");
        _appId = configuration.AppId;
    }

    public async Task<IEnumerable<ExceptionLogMessage>> GetExceptionsAroundAsync(DateTime dateTime)
    {
        var start = dateTime.AddMinutes(-2);
        var end = dateTime.AddMinutes(1);

        var query = $@"
            exceptions
            | project timestamp, type, operation_Id, cloud_RoleName, outerMessage, operation_Name, innermostMessage
            | where timestamp between (todatetime('{start:yyyy-MM-ddTHH:mm:ss.fffZ}') .. todatetime('{end:yyyy-MM-ddTHH:mm:ss.fffZ}'))
            | order by timestamp desc";

        var queryResults = await _client.Query.ExecuteAsync(_appId, query);

        var result = new List<ExceptionLogMessage>();
        if (queryResults?.Tables?.Any() == true && queryResults.Tables[0].Rows?.Any() == true)
        {
            foreach (var logRow in queryResults.Tables[0].Rows)
            {
                result.Add(new ExceptionLogMessage()
                {
                    Timestamp = (DateTime)logRow[0],
                    Type = (string)logRow[1],
                    OperationId = (string)logRow[2],
                    CloudRoleName = (string)logRow[3],
                    OuterMessage = (string)logRow[4],
                    OperationName = (string)logRow[5],
                    InnerMostMessage = (string)logRow[6]
                });
            }
        }

        return result;
    }
}