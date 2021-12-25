using System.Text;
using Azure.Messaging.ServiceBus.Administration;
using Microsoft.Azure.ServiceBus;
using Microsoft.Azure.ServiceBus.Core;
using ServiceBusMonitor.Api.Apis.Configuration;
using ServiceBusMonitor.Api.Apis.Interfaces;
using ServiceBusMonitor.Api.Models;

namespace ServiceBusMonitor.Api.Apis
{
    public class ServiceBusApi : IServiceBusApi
    {
        private readonly BusConfiguration _configuration;

        private IEnumerable<ServiceBusQueue> _queues = new List<ServiceBusQueue>();
        private IEnumerable<ServiceBusTopic> _topics = new List<ServiceBusTopic>();

        public ServiceBusApi(BusConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IEnumerable<ServiceBusQueue> GetQueues() => _queues;
        public IEnumerable<ServiceBusTopic> GetTopics() => _topics;

        public async Task ReloadQueuesAsync()
        {
            var updatedQueueList = new List<ServiceBusQueue>();

            var client = new ServiceBusAdministrationClient(_configuration.ConnectionString);
            var queues = client.GetQueuesAsync()?.GetAsyncEnumerator();

            if (queues != default)
            {
                while (await queues.MoveNextAsync())
                {
                    var queue = queues.Current;
                    var runtimeProperties = await client.GetQueueRuntimePropertiesAsync(queue.Name);

                    updatedQueueList.Add(new ServiceBusQueue()
                    {
                        Name = queue.Name,
                        ActiveMessages = runtimeProperties?.Value?.ActiveMessageCount ?? 0,
                        DeadLetteredMessages = runtimeProperties?.Value?.DeadLetterMessageCount ?? 0
                    });
                }
            }

            _queues = updatedQueueList.OrderBy(t => t.Name);
        }

        public async Task ReloadTopicsAsync()
        {
            // todo: lock & return if locked

            var updatedTopicList = new List<ServiceBusTopic>();
            
            var client = new ServiceBusAdministrationClient(_configuration.ConnectionString);
            var topics = client.GetTopicsAsync()?.GetAsyncEnumerator();

            if (topics != default)
            {
                while (await topics.MoveNextAsync())
                {
                    var subscriptionList = new List<ServiceBusTopicSubscription>();
                    var topic = topics.Current;

                    var subscriptionRuntimeProperties = client.GetSubscriptionsRuntimePropertiesAsync(topic.Name)?.GetAsyncEnumerator();
                    if (subscriptionRuntimeProperties != default)
                    {
                        while (await subscriptionRuntimeProperties.MoveNextAsync())
                        {
                            var subscriptionRuntimeProperty = subscriptionRuntimeProperties.Current;

                            subscriptionList.Add(new ServiceBusTopicSubscription()
                            {
                                Name = subscriptionRuntimeProperty.SubscriptionName,
                                ActiveMessages = subscriptionRuntimeProperty.ActiveMessageCount,
                                DeadLetteredMessages = subscriptionRuntimeProperty.DeadLetterMessageCount
                            });
                        }
                    }

                    updatedTopicList.Add(new ServiceBusTopic()
                    {
                        Name = topic.Name,
                        Subscriptions = subscriptionList.OrderBy(s => s.Name)
                    });
                }
            }

            _topics = updatedTopicList.OrderBy(t => t.Name);
        }

        public async Task<IEnumerable<DlqMessage>> GetDqlMessagesFromQueueAsync(string queueName)
        {
            var deadLetterPath = EntityNameHelper.FormatDeadLetterPath(queueName);

            var client = new MessageReceiver(
                _configuration.ConnectionString,
                deadLetterPath,
                ReceiveMode.PeekLock);

            var result = new List<DlqMessage>();
            Message message;
            do
            {
                message = await client.PeekAsync();
                if (message != default)
                {
                    result.Add(new DlqMessage()
                    {
                        Id = message.MessageId,
                        Enqueued = message.ScheduledEnqueueTimeUtc,
                        Content = Encoding.UTF8.GetString(message.Body).TrimStart((char)65279)
                    });
                }
            } while (message != default);

            return result;
        }

        public async Task<IEnumerable<DlqMessage>> GetDqlMessagesFromTopicSubscriptionAsync(string topicName, string subscriptionName)
        {
            var subPath = EntityNameHelper.FormatSubscriptionPath(topicName, subscriptionName);
            var deadLetterPath = EntityNameHelper.FormatDeadLetterPath(subPath);

            var client = new MessageReceiver(
                _configuration.ConnectionString,
                deadLetterPath,
                ReceiveMode.PeekLock);

            var result = new List<DlqMessage>();
            Message message;
            do
            {
                message = await client.PeekAsync();
                if (message != default)
                {
                    result.Add(new DlqMessage()
                    {
                        Id = message.MessageId,
                        Enqueued = message.SystemProperties.EnqueuedTimeUtc,
                        Content = Encoding.UTF8.GetString(message.Body).TrimStart((char)65279)
                    });
                }
            } while (message != default);

            return result;
        }
    }
}