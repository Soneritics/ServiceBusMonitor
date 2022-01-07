class SaveAction implements IAction {
    process(
        actionData: ActionData,
        activeBusColumn: ActiveBusColumn,
        options: ServiceBusOptions): void {
        var downloadAction = $('<a href="javascript:;">Download</a>');
        downloadAction.on('click', () => {
            var blob = new Blob([actionData.message.content], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "msg-" + actionData.message.id + ".json");

            return false;
        });
        actionData.container.append(downloadAction);
    }
}