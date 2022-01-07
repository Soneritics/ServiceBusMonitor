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

        // Fetch Application Insights data
        this.eventHandler.on(
            'ShowApplicationInsightsData',
            (enqueuedDateTime: string) => this.showApplicationInsightsData(enqueuedDateTime));
    }

    private activateBusColumn(column: ActiveBusColumn): void {
        this.ui.reset();

        // Determine the active bus column
        // If an inactive column is clicked, make it active.
        // If an active column is clicked, make it inactive.
        this.activeBusColumn = this.activeBusColumn === null || this.activeBusColumn.hash !== column.hash
            ? column
            : null;

        // Trigger the UI event to activate the correct column
        this.eventHandler.trigger("ActivateActiveBusColumnInInterface", $("body"));

        // Load the deadletter queue messages
        if (this.activeBusColumn) {
            this.ui.loadDeadletterQueueMessages(this.activeBusColumn);
        }
    }

    private activateActiveBusColumnInInterface(selector: JQuery): void {
        this.ui.activateActiveBusColumnInInterface(selector, this.activeBusColumn);
    }

    private showApplicationInsightsData(enqueuedDateTime: string): void {
        this.ui.showApplicationInsightsData(enqueuedDateTime);
    }
}