interface IAction {
    process(
        actionData: ActionData,
        activeBusColumn: ActiveBusColumn,
        options: ServiceBusOptions): void;
}