class DeadLetterQueuePostDataParser {
    parse(options: ServiceBusOptions, activeBusColumn: ActiveBusColumn): any {
        if (activeBusColumn.subscription) {
            return this.parseFromSubscription(options, activeBusColumn);
        } else {
            return this.parseFromQueue(options, activeBusColumn);
        }
    }

    private parseFromQueue(
        options: ServiceBusOptions,
        activeBusColumn: ActiveBusColumn): any {
        return {
            busName: options.activeBus,
            queueName: activeBusColumn.queue.queueName
        };
    }

    private parseFromSubscription(
        options: ServiceBusOptions,
        activeBusColumn: ActiveBusColumn): any {
        return {
            busName: options.activeBus,
            topicName: activeBusColumn.subscription.topicName,
            subscriptionName: activeBusColumn.subscription.subscriptionName
        };
    }
}