class UI {
    private readonly options: ServiceBusOptions;
    private readonly eventHandler: EventHandler;

    constructor(options: ServiceBusOptions, eventHandler: EventHandler) {
        this.options = options;
        this.eventHandler = eventHandler;
    }

    /**
     * Reset the interface elements.
     */
    reset(): void {
        $('#' + this.options.containers.deadletterMessages).hide();
        $('#' + this.options.containers.applicationInsights).hide();
    }

    /**
     * Initialize the User Interface.
     */
    init() {
        // First, register the components and actions that listen to events
        this.registerComponents();

        // First, reset the UI
        this.reset();

        // Reload the last update timestamp
        (new Loader(
            "#" + this.options.containers.lastUpdate,
            this.options.endpoints.lastUpdate,
            10000)).start();

        // Reload the service bus queues
        var queueReloader = new Loader(
            "#" + this.options.containers.queues,
            this.options.endpoints.queues,
            5000,
            false);

        queueReloader.callbackHandler = new BusQueueCallbackHandler(
            "#" + this.options.containers.queues,
            this.eventHandler);

        queueReloader.start();

        // Reload the service bus topics and subscriptions
        var subscriptionReloader = new Loader(
            "#" + this.options.containers.topics,
            this.options.endpoints.topics,
            5000,
            false);

        subscriptionReloader.callbackHandler = new BusSubscriptionCallbackHandler(
            "#" + this.options.containers.topics,
            this.eventHandler);

        subscriptionReloader.start();
    }

    /**
     * Activate the active bus column in the interface, in a given scope.
     * @param scope A JQuery selector to find for the row to 'activate'.
     * @param activeBusColumn
     */
    activateActiveBusColumnInInterface(scope: JQuery, activeBusColumn?: ActiveBusColumn) {
        scope.find('.active-bus-line').removeClass('active-bus-line');

        if (activeBusColumn) {
            $(scope).find('tr[data-hash="' + activeBusColumn.hash + '"]').addClass('active-bus-line');
        }
    }

    /**
     * Load the dead letter queue messages.
     * @param activeBusColumn
     */
    loadDeadletterQueueMessages(activeBusColumn: ActiveBusColumn) {
        var dlqContainer = '#' + this.options.containers.deadletterMessages;
        $(dlqContainer).show();

        var selector = dlqContainer + " > div";
        var data = (new DeadLetterQueuePostDataParser()).parse(this.options, activeBusColumn);
        var url = activeBusColumn.queue
            ? this.options.endpoints.dlqMessagesOnQueue
            : this.options.endpoints.dlqMessagesOnTopic;

        var loader = new Loader(selector, url, 0, true, false);
        loader.callbackHandler = new DlqMessagesCallbackHandler(selector, this.eventHandler);
        loader.start(data);
    }

    /**
     * Load Application Insights data based on a timestamp of which the message was enqueued.
     * @param enqueuedDateTime
     */
    showApplicationInsightsData(enqueuedDateTime: string) {
        var aiContainer = '#' + this.options.containers.applicationInsights;
        $(aiContainer).show();

        var selector = aiContainer + " > div";
        var url = this.options.endpoints.exceptionLogs;
        var data = {
            busName: this.options.activeBus,
            dateTime: enqueuedDateTime
        };

        var loader = new Loader(selector, url, 0, true, false);
        loader.callbackHandler = new GenericTableBuilderCallbackHandler(
            selector,
            "No logs found.");

        loader.start(data);
    }

    /**
     * Register the necessary components, actions, etc.
     */
    private registerComponents(): void {

    }
}