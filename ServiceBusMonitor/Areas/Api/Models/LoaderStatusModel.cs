namespace ServiceBusMonitor.Areas.Api.Models;

public class LoaderStatusModel
{
    public string Status { get; set; }
    public LoaderStatusType LoaderStatusType { get; set; } = LoaderStatusType.Info;
    public string RedirectUri { get; set; } = string.Empty;

    public LoaderStatusModel(string status)
    {
        Status = status;
    }
}