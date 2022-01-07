class DlqMessagesCallbackHandler implements ICallbackHandler {
    private readonly selector: string;
    private readonly eventHandler: EventHandler;

    constructor(selector: string, eventHandler: EventHandler) {
        this.selector = selector;
        this.eventHandler = eventHandler;
    }

    handle(messages?: any): void {
        var table = $(
            '<table class="table table-striped table-hover">' +
            '   <thead>' +
            '       <tr>' +
            '           <th>Enqueued</th>' +
            '           <th>Content</th>' +
            '       </tr>' +
            '   </thead>' +
            '   <tbody></tbody>' +
            '</table>');

        if (messages) {
            messages.forEach(message => {
                var tr = $('<tr></tr>');
                tr.attr('data-message-id', message.id);
                tr.attr('data-message-enqueued', message.enqueued);

                var td = $('<td></td>');
                td.text(message.enqueued);
                tr.append(td);

                td = $('<td></td>');
                td.text(message.content);

                var lineActions = $('<div></div>');
                // todo: actions
                td.append(lineActions);

                tr.append(td);
                table.find('tbody').append(tr);
            });
        }

        var target = $(this.selector);
        target.html('');
        target.append(table);

        target.find('tbody > tr').on('click', (e) => {
            target.find('.active-message-line').removeClass('active-message-line');
            $(e.currentTarget).addClass('active-message-line');

            this.eventHandler.trigger(
                "ShowApplicationInsightsData",
                $(e.currentTarget).data('message-enqueued'));
        });
    }
}