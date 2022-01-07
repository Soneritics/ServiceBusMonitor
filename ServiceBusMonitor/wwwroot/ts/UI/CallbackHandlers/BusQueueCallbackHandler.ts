class BusQueueCallbackHandler implements ICallbackHandler
{
    private readonly selector: string;
    private readonly eventHandler: EventHandler;

    constructor(selector: string, eventHandler: EventHandler) {
        this.selector = selector;
        this.eventHandler = eventHandler;
    }

    handle(data: any): void {
        var table = $(
            '<table class="table table-striped table-hover">' +
            '   <thead>' +
            '       <tr>' +
            '           <th>Queue</th>' +
            '           <th>Active</th>' +
            '           <th>DLQ</th>' +
            '       </tr>' +
            '   </thead>' +
            '   <tbody></tbody>' +
            '</table>');

        if (data != undefined) {
            data.forEach(queue => {
                var tr = $('<tr></tr>');
                tr.attr('data-hash', 'queue-' + queue.name);
                tr.attr('data-queue-name', queue.name);

                var td = $('<td></td>');
                td.text(queue.name);
                tr.append(td);

                td = $('<td></td>');
                td.text(queue.activeMessages);
                tr.append(td);

                td = $('<td></td>');
                td.text(queue.deadLetteredMessages);
                tr.append(td);

                table.find('tbody').append(tr);
            });
        }

        this.eventHandler.trigger("ActivateActiveBusColumnInInterface", table);

        var target = $(this.selector);
        var html = table[0].outerHTML;
        if (target.html() !== html) {
            target.html(html);

            target.find('tbody > tr').on('click', (e) => {
                var activeBusColumn = new ActiveBusColumn();
                activeBusColumn.hash = $(e.currentTarget).data('hash');
                activeBusColumn.queue = new ActiveBusQueueColumn($(e.currentTarget).data('queue-name'));

                this.eventHandler.trigger("ActivateBusColumn", activeBusColumn);
            });
        }
    }
}