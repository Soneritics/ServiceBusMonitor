class EventHandler {
    private eventListeners: { [id: string]: Array<((data?: any) => void)> } = {};

    on(event: string, handler: (data?: any) => void): void {
        this.off(event, handler);

        if (this.eventListeners[event] === undefined
            || this.eventListeners[event] == null) {
            this.eventListeners[event] = [];
        }

        this.eventListeners[event].push(handler);
    }

    off(event: string, handler: (data?: any) => void): void {
        if (this.eventListeners[event] != undefined
            && this.eventListeners[event] != null) {
            this.eventListeners[event] = this.eventListeners[event].filter(e => e !== handler);
        }
    }

    trigger(event: string, data?: any): void {
        if (this.eventListeners[event] !== undefined
            || this.eventListeners[event] != null
            && this.eventListeners[event].length > 0) {
            for (var handler of this.eventListeners[event]) {
                handler(data);
            }
        }
    }
}