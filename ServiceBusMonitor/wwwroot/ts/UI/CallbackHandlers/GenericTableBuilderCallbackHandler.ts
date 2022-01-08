class GenericTableBuilderCallbackHandler implements ICallbackHandler {
    private readonly noResultsText: string;
    private readonly selector: string;

    constructor(selector: string, noResultsText: string) {
        this.noResultsText = noResultsText;
        this.selector = selector;
    }

    handle(json?: any): void {
        if (!json) {
            $(this.selector).html('<em>' + this.noResultsText + '</em>');
            return;
        }

        var table = $('<table class="table table-striped table-hover table-sm"><thead><tr></tr></thead><tbody></tbody></table>');

        for (var heading in json[0]) {
            var th = $('<th></th>');
            th.text(heading);
            $(table).find('thead > tr').append(th);
        }

        for (var row in json) {
            var tr = $('<tr></tr>');

            for (var heading in json[row]) {
                var td = $('<td></td>');
                td.text(json[row][heading]);
                tr.append(td);
            }

            $(table).children('tbody').append(tr);
        }

        $(this.selector).html("");
        $(this.selector).append(table);
    }
}