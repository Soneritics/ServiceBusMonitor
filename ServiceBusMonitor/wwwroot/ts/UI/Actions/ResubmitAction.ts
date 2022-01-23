class ResubmitAction implements IAction {
    private readonly eventHandler: EventHandler;

    constructor(eventHandler: EventHandler) {
        this.eventHandler = eventHandler;
    }

    process(
        actionData: ActionData,
        activeBusColumn: ActiveBusColumn,
        options: ServiceBusOptions): void {
        var deleteAction = $('<a href="javascript:;" class="btn btn-primary btn-xs px-2 mr-2" title="Resubmit message"><i class="fas fa-redo"></i></a>');
        deleteAction.on('click', (e) => {
            $(e.currentTarget).off('click');
            $(e.currentTarget).html('<i class="fas fa-circle-notch fa-spin"></i>');

            var apiBaseUri = "";
            var data = {};

            switch (activeBusColumn.queue ? true : false) {
                case true:
                    apiBaseUri = options.endpoints.actionResubmitDlqMessageToQueue;
                    data = {
                        busName: options.activeBus,
                        queueName: activeBusColumn.queue.queueName,
                        messageId: actionData.message.id
                    };
                    break;

                default:
                    apiBaseUri = options.endpoints.actionResubmitDlqMessageToTopicSubscription;
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