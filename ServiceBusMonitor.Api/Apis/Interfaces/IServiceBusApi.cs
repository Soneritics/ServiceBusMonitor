using ServiceBusMonitor.Api.Models;

namespace ServiceBusMonitor.Api.Apis.Interfaces;

public interface IServiceBusApi
{
    Task ReloadQueuesAsync();
    Task ReloadTopicsAsync();
    
    IEnumerable<ServiceBusQueue> GetQueues();
    IEnumerable<ServiceBusTopic> GetTopics();
    
    Task<IEnumerable<DlqMessage>> GetDqlMessagesFromQueueAsync(string queueName);
    Task<IEnumerable<DlqMessage>> GetDqlMessagesFromTopicSubscriptionAsync(string topicName, string subscriptionName);

    Task RemoveDqlMessagesFromQueueAsync(string queueName, string messageId);
    Task RemoveDqlMessagesFromTopicSubscriptionAsync(string topicName, string subscriptionName, string messageId);
}