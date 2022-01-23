class SaveAction implements IAction {
    process(
        actionData: ActionData,
        activeBusColumn: ActiveBusColumn,
        options: ServiceBusOptions): void {
        var downloadAction = $('<a href="javascript:;" class="btn btn-primary btn-xs px-2 mr-2" alt="Download message"><i class="fas fa-download"></i></a>');
        downloadAction.on('click', () => {
            var blob = new Blob([actionData.message.content], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "msg-" + actionData.message.id + ".json");

            return false;
        });
        actionData.container.append(downloadAction);
    }
}