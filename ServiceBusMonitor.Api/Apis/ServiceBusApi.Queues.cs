using System.Text;
using Azure.Messaging.ServiceBus.Administration;
using Microsoft.Azure.ServiceBus;
using Microsoft.Azure.ServiceBus.Core;
using ServiceBusMonitor.Api.Models;

namespace ServiceBusMonitor.Api.Apis
{
    public partial class ServiceBusApi
    {
        private IEnumerable<ServiceBusQueue> _queues = new List<ServiceBusQueue>();

        public IEnumerable<ServiceBusQueue> GetQueues() => _queues;

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
                    var runtimeProperties = await client
                        .GetQueueRuntimePropertiesAsync(queue.Name);

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

        public async Task<IEnumerable<DlqMessage>> GetDqlMessagesFromQueueAsync(string queueName)
        {
            var deadLetterPath = EntityNameHelper.FormatDeadLetterPath(queueName);

            var client = new MessageReceiver(
                _configuration.ConnectionString,
                deadLetterPath);

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

        public async Task RemoveDqlMessagesFromQueueAsync(string queueName, string messageId)
        {
            var deadLetterPath = EntityNameHelper.FormatDeadLetterPath(queueName);

            var client = new MessageReceiver(
                _configuration.ConnectionString,
                deadLetterPath);

            Message? message;
            do
            {
                message = await client.ReceiveAsync();
                if (message != default && messageId.Equals(message.MessageId))
                {
                    await client.CompleteAsync(message.SystemProperties.LockToken);
                    message = default;
                }
            } while (message != default);

            // todo: throw message not found exception
        }
    }
}