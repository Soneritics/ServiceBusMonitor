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
        // First, reset the UI
        this.reset();

        // Reload the last update timestamp
        (new Reloader(
            "#" + this.options.containers.lastUpdate,
            this.options.endpoints.lastUpdate,
            10000)).start();

        // Reload the service bus queues
        var queueReloader = new Reloader(
            "#" + this.options.containers.queues,
            this.options.endpoints.queues,
            5000,
            false);

        queueReloader.callbackHandler = new BusQueueCallbackHandler(
            "#" + this.options.containers.queues,
            this.eventHandler);

        queueReloader.start();

        // Reload the service bus topics and subscriptions
        var subscriptionReloader = new Reloader(
            "#" + this.options.containers.topics,
            this.options.endpoints.topics,
            5000,
            false);

        subscriptionReloader.callbackHandler = new BusSubscriptionCallbackHandler(
            "#" + this.options.containers.topics,
            this.eventHandler);

        subscriptionReloader.start();
    }

    activateActiveBusColumnInInterface(scope: JQuery, activeBusColumn?: ActiveBusColumn) {
        scope.find('.active-bus-line').removeClass('active-bus-line');

        if (activeBusColumn !== null) {
            $(scope).find('tr[data-hash="' + activeBusColumn.hash + '"]').addClass('active-bus-line');
        }
    }
}