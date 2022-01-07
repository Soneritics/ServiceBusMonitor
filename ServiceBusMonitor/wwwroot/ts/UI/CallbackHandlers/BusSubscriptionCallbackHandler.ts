class BusSubscriptionCallbackHandler implements ICallbackHandler
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
            '           <th>Topic</th>' +
            '           <th>Subscription</th>' +
            '           <th>Active</th>' +
            '           <th>DLQ</th>' +
            '       </tr>' +
            '   </thead>' +
            '   <tbody></tbody>' +
            '</table>');

        if (data != undefined) {
            data.forEach(topic => {
                if (topic.subscriptions == null || topic.subscriptions.length === 0) {
                    var tr = $('<tr></tr>');
                    tr.attr('data-hash', 'topic-' + topic.name);

                    var td = $('<td cellspan="4"></td>');
                    td.text(topic.name);
                    tr.append(td);

                    table.find('tbody').append(tr);
                } else {
                    topic.subscriptions.forEach(subscription => {
                        var tr = $('<tr></tr>');
                        tr.attr('data-hash', 'topic-' + topic.name + '-' + subscription.name);
                        tr.attr('data-topic-name', topic.name);
                        tr.attr('data-subscription-name', subscription.name);

                        var td = $('<td></td>');
                        td.text(topic.name);
                        tr.append(td);

                        td = $('<td></td>');
                        td.text(subscription.name);
                        tr.append(td);

                        td = $('<td></td>');
                        td.text(subscription.activeMessages);
                        tr.append(td);

                        td = $('<td></td>');
                        td.text(subscription.deadLetteredMessages);
                        tr.append(td);

                        table.find('tbody').append(tr);
                    });
                }
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
                activeBusColumn.subscription = new ActiveBusSubscriptionColumn(
                    $(e.currentTarget).data('topic-name'),
                    $(e.currentTarget).data('subscription-name'));

                this.eventHandler.trigger("ActivateBusColumn", activeBusColumn);
            });
        }
    }
}