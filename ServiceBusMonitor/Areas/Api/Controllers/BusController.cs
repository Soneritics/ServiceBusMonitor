using Microsoft.AspNetCore.Mvc;
using ServiceBusMonitor.Api;
using ServiceBusMonitor.Areas.Api.Models;

namespace ServiceBusMonitor.Areas.Api.Controllers;

[Area("Api")]
[Route("api/[controller]/[action]")]
[ApiController]
public class BusController : ApiControllerBase
{
    public BusController(IApiCollection apiCollection)
        : base(apiCollection)
    {
    }

    [HttpGet]
    public JsonResult Topics(string busName)
    {
        return new JsonResult(ApiCollection.GetServiceBusApi(busName).GetTopics());
    }

    [HttpGet]
    public JsonResult Queues(string busName)
    {
        return new JsonResult(ApiCollection.GetServiceBusApi(busName).GetQueues());
    }

    [HttpGet]
    public async Task<JsonResult> DlqMessagesOnQueue(string busName, string queueName)
    {
        var messages = await ApiCollection
            .GetServiceBusApi(busName)
            .GetDqlMessagesFromQueueAsync(queueName);

        return new JsonResult(messages);
    }

    [HttpPost]
    public async Task<IActionResult> RemoveDlqMessageFromQueue(QueueMessageToDelete message)
    {
        try
        {
            await ApiCollection
                .GetServiceBusApi(message.BusName)
                .RemoveDqlMessagesFromQueueAsync(message.QueueName, message.MessageId);
        }
        catch (Exception e)
        {
            return new JsonResult(e)
            {
                StatusCode = 500
            };
        }

        return new OkResult();
    }

    [HttpPost]
    public async Task<IActionResult> RemoveDlqMessageFromTopicSubscription(TopicMessageToDelete message)
    {
        try
        {
            await ApiCollection
                .GetServiceBusApi(message.BusName)
                .RemoveDqlMessagesFromTopicSubscriptionAsync(
                    message.TopicName,
                    message.SubscriptionName,
                    message.MessageId);
        }
        catch (Exception e)
        {
            return new JsonResult(e)
            {
                StatusCode = 500
            };
        }

        return new OkResult();
    }

    [HttpGet]
    public async Task<JsonResult> DlqMessagesOnTopic(string busName, string topicName, string subscriptionName)
    {
        var messages = await ApiCollection
            .GetServiceBusApi(busName)
            .GetDqlMessagesFromTopicSubscriptionAsync(topicName, subscriptionName);

        return new JsonResult(messages);
    }
}