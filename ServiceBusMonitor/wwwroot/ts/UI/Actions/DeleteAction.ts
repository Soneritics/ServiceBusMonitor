class DeleteAction implements IAction {
    private readonly eventHandler: EventHandler;

    constructor(eventHandler: EventHandler) {
        this.eventHandler = eventHandler;
    }

    process(
        actionData: ActionData,
        activeBusColumn: ActiveBusColumn,
        options: ServiceBusOptions): void {
        var deleteAction = $('<a href="javascript:;">Delete</a>');
        deleteAction.on('click', () => {
            $(this).off('click');
            $(this).html('<i class="fas fa-circle-notch fa-spin"></i>');

            var apiBaseUri = "";
            var data = {};

            switch (activeBusColumn.queue ? true : false) {
                case true:
                    apiBaseUri = options.endpoints.actionRemoveDlqMessageFromQueue;
                    data = {
                        busName: options.activeBus,
                        queueName: activeBusColumn.queue.queueName,
                        messageId: actionData.message.id
                    };
                    break;

                default:
                    apiBaseUri = options.endpoints.actionRemoveDlqMessageFromTopicSubscription;
                    data = {
                        busName: options.activeBus,
                        topicName: activeBusColumn.subscription.topicName,
                        subscriptionName: activeBusColumn.subscription.subscriptionName,
                        messageId: actionData.message.id
                    };
                    break;
            }

            $.ajax({
                type: "POST",
                url: apiBaseUri,
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: () => {
                    this.eventHandler.trigger("LoadDeadletterQueueMessages");
                }
            });

            return false;
        });

        actionData.container.append(deleteAction);
    }
}