class Reloader {
    loaderHtml: string = '<i class="fas fa-circle-notch fa-spin"></i>';
    private readonly selector: string;
    private readonly url: string;
    private readonly timeout: number;
    private readonly loop: Boolean = true;
    private readonly showLoaderIcon: Boolean = true;

    callbackHandler?: ICallbackHandler;

    constructor(
        selector: string,
        url: string,
        timeout?: number,
        showLoaderIcon?: Boolean,
        loop?: Boolean) {
        this.selector = selector;
        this.url = url;
        this.timeout = timeout ?? 10000;
        this.showLoaderIcon = showLoaderIcon ?? true;
        this.loop = loop ?? true;
    }

    reload(): void {
        if (this.showLoaderIcon) {
            $(this.selector).html(this.loaderHtml);
        }

        $.get(this.url, (response, status, xhr) => {
                if (this.showLoaderIcon) {
                    $(this.selector).html("");
                }

            if (this.callbackHandler) {
                    this.callbackHandler.handle(response);
                } else {
                    $(this.selector).html(response);
                }
            })
            .fail(() => {
                alert("error"); // todo
            })
            .always(() => {
                if (this.loop) {
                    setTimeout(() => {
                            this.reload();
                        },
                        this.timeout
                    );
                }
            });
    }

    start(): void {
        this.reload();
    }
}