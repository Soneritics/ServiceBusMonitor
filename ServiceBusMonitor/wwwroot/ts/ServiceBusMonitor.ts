class ServiceBusMonitor {
    private readonly options: ServiceBusOptions;
    private readonly eventHandler: EventHandler;
    private ui: UI;

    private activeBusColumn?: ActiveBusColumn = null;

    constructor(options: ServiceBusOptions) {
        this.options = options;
        this.eventHandler = new EventHandler();
    }

    init(): void {
        this.bindEvents();

        this.ui = new UI(
            this.options,
            this.eventHandler);

        this.ui.init();
    }

    private bindEvents(): void {
        // Click on queue or subscription (on topic)
        this.eventHandler.on(
            'ActivateBusColumn',
            (column: ActiveBusColumn) => this.activateBusColumn(column));

        // Activate the column in the UI
        this.eventHandler.on(
            'ActivateActiveBusColumnInInterface',
            (selector: JQuery) => this.activateActiveBusColumnInInterface(selector));
    }

    private activateBusColumn(column: ActiveBusColumn) {
        this.ui.reset();

        this.activeBusColumn = this.activeBusColumn === null || this.activeBusColumn.hash !== column.hash
            ? column
            : null;

        this.eventHandler.trigger("ActivateActiveBusColumnInInterface", $("body"));
    }

    private activateActiveBusColumnInInterface(selector: JQuery) {
        this.ui.activateActiveBusColumnInInterface(selector, this.activeBusColumn);
    }
}