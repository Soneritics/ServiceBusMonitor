var ServiceBusMonitor = /** @class */ (function () {
    function ServiceBusMonitor(options) {
        this.activeBusColumn = null;
        this.options = options;
        this.eventHandler = new EventHandler();
    }
    ServiceBusMonitor.prototype.init = function () {
        this.bindEvents();
        this.ui = new UI(this.options, this.eventHandler);
        this.ui.init();
    };
    ServiceBusMonitor.prototype.bindEvents = function () {
        var _this = this;
        // Click on queue or subscription (on topic)
        this.eventHandler.on('ActivateBusColumn', function (column) { return _this.activateBusColumn(column); });
        // Activate the column in the UI
        this.eventHandler.on('ActivateActiveBusColumnInInterface', function (selector) { return _this.activateActiveBusColumnInInterface(selector); });
    };
    ServiceBusMonitor.prototype.activateBusColumn = function (column) {
        this.ui.reset();
        this.activeBusColumn = this.activeBusColumn === null || this.activeBusColumn.hash !== column.hash
            ? column
            : null;
        this.eventHandler.trigger("ActivateActiveBusColumnInInterface", $("body"));
    };
    ServiceBusMonitor.prototype.activateActiveBusColumnInInterface = function (selector) {
        this.ui.activateActiveBusColumnInInterface(selector, this.activeBusColumn);
    };
    return ServiceBusMonitor;
}());
var EventHandler = /** @class */ (function () {
    function EventHandler() {
        this.eventListeners = {};
    }
    EventHandler.prototype.on = function (event, handler) {
        this.off(event, handler);
        if (this.eventListeners[event] === undefined
            || this.eventListeners[event] == null) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    };
    EventHandler.prototype.off = function (event, handler) {
        if (this.eventListeners[event] != undefined
            && this.eventListeners[event] != null) {
            this.eventListeners[event] = this.eventListeners[event].filter(function (e) { return e !== handler; });
        }
    };
    EventHandler.prototype.trigger = function (event, data) {
        if (this.eventListeners[event] !== undefined
            || this.eventListeners[event] != null
                && this.eventListeners[event].length > 0) {
            for (var _i = 0, _a = this.eventListeners[event]; _i < _a.length; _i++) {
                var handler = _a[_i];
                handler(data);
            }
        }
    };
    return EventHandler;
}());
var Containers = /** @class */ (function () {
    function Containers() {
        this.lastUpdate = "last-update";
        this.queues = "bus-queues";
        this.topics = "bus-topics";
        this.deadletterMessages = "dlq-messages-holder";
        this.applicationInsights = "dlq-message-ai-logs-holder";
    }
    return Containers;
}());
var Endpoints = /** @class */ (function () {
    function Endpoints() {
    }
    return Endpoints;
}());
var ServiceBusOptions = /** @class */ (function () {
    function ServiceBusOptions(endpoints, containers) {
        this.endpoints = endpoints;
        this.containers = containers !== null && containers !== void 0 ? containers : new Containers();
    }
    return ServiceBusOptions;
}());
var ActiveBusColumn = /** @class */ (function () {
    function ActiveBusColumn() {
    }
    return ActiveBusColumn;
}());
var ActiveBusQueueColumn = /** @class */ (function () {
    function ActiveBusQueueColumn(queueName) {
        this.queueName = queueName;
    }
    return ActiveBusQueueColumn;
}());
var ActiveBusSubscriptionColumn = /** @class */ (function () {
    function ActiveBusSubscriptionColumn(topicName, subscriptionName) {
        this.topicName = topicName;
        this.subscriptionName = subscriptionName;
    }
    return ActiveBusSubscriptionColumn;
}());
var UI = /** @class */ (function () {
    function UI(options, eventHandler) {
        this.options = options;
        this.eventHandler = eventHandler;
    }
    /**
     * Reset the interface elements.
     */
    UI.prototype.reset = function () {
        $('#' + this.options.containers.deadletterMessages).hide();
        $('#' + this.options.containers.applicationInsights).hide();
    };
    /**
     * Initialize the User Interface.
     */
    UI.prototype.init = function () {
        // First, reset the UI
        this.reset();
        // Reload the last update timestamp
        (new Reloader("#" + this.options.containers.lastUpdate, this.options.endpoints.lastUpdate, 10000)).start();
        // Reload the service bus queues
        var queueReloader = new Reloader("#" + this.options.containers.queues, this.options.endpoints.queues, 5000, false);
        queueReloader.callbackHandler = new BusQueueCallbackHandler("#" + this.options.containers.queues, this.eventHandler);
        queueReloader.start();
        // Reload the service bus topics and subscriptions
        var subscriptionReloader = new Reloader("#" + this.options.containers.topics, this.options.endpoints.topics, 5000, false);
        subscriptionReloader.callbackHandler = new BusSubscriptionCallbackHandler("#" + this.options.containers.topics, this.eventHandler);
        subscriptionReloader.start();
    };
    UI.prototype.activateActiveBusColumnInInterface = function (scope, activeBusColumn) {
        scope.find('.active-bus-line').removeClass('active-bus-line');
        if (activeBusColumn !== null) {
            $(scope).find('tr[data-hash="' + activeBusColumn.hash + '"]').addClass('active-bus-line');
        }
    };
    return UI;
}());
var Reloader = /** @class */ (function () {
    function Reloader(selector, url, timeout, showLoaderIcon, loop) {
        this.loaderHtml = '<i class="fas fa-circle-notch fa-spin"></i>';
        this.loop = true;
        this.showLoaderIcon = true;
        this.selector = selector;
        this.url = url;
        this.timeout = timeout !== null && timeout !== void 0 ? timeout : 10000;
        this.showLoaderIcon = showLoaderIcon !== null && showLoaderIcon !== void 0 ? showLoaderIcon : true;
        this.loop = loop !== null && loop !== void 0 ? loop : true;
    }
    Reloader.prototype.reload = function () {
        var _this = this;
        if (this.showLoaderIcon) {
            $(this.selector).html(this.loaderHtml);
        }
        $.get(this.url, function (response, status, xhr) {
            if (_this.showLoaderIcon) {
                $(_this.selector).html("");
            }
            if (_this.callbackHandler) {
                _this.callbackHandler.handle(response);
            }
            else {
                $(_this.selector).html(response);
            }
        })
            .fail(function () {
            alert("error"); // todo
        })
            .always(function () {
            if (_this.loop) {
                setTimeout(function () {
                    _this.reload();
                }, _this.timeout);
            }
        });
    };
    Reloader.prototype.start = function () {
        this.reload();
    };
    return Reloader;
}());
var BusQueueCallbackHandler = /** @class */ (function () {
    function BusQueueCallbackHandler(selector, eventHandler) {
        this.selector = selector;
        this.eventHandler = eventHandler;
    }
    BusQueueCallbackHandler.prototype.handle = function (data) {
        var _this = this;
        var table = $('<table class="table table-striped table-hover">' +
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
            data.forEach(function (queue) {
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
            target.find('tbody > tr').on('click', function (e) {
                var activeBusColumn = new ActiveBusColumn();
                activeBusColumn.hash = $(e.currentTarget).data('hash');
                activeBusColumn.queue = new ActiveBusQueueColumn($(e.currentTarget).data('queue-name'));
                _this.eventHandler.trigger("ActivateBusColumn", activeBusColumn);
            });
        }
    };
    return BusQueueCallbackHandler;
}());
var BusSubscriptionCallbackHandler = /** @class */ (function () {
    function BusSubscriptionCallbackHandler(selector, eventHandler) {
        this.selector = selector;
        this.eventHandler = eventHandler;
    }
    BusSubscriptionCallbackHandler.prototype.handle = function (data) {
        var _this = this;
        var table = $('<table class="table table-striped table-hover">' +
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
            data.forEach(function (topic) {
                if (topic.subscriptions == null || topic.subscriptions.length === 0) {
                    var tr = $('<tr></tr>');
                    tr.attr('data-hash', 'topic-' + topic.name);
                    var td = $('<td cellspan="4"></td>');
                    td.text(topic.name);
                    tr.append(td);
                    table.find('tbody').append(tr);
                }
                else {
                    topic.subscriptions.forEach(function (subscription) {
                        var tr = $('<tr></tr>');
                        tr.attr('data-hash', 'topic-' + topic.name + '-' + subscription.name);
                        tr.attr('topic-name', topic.name);
                        tr.attr('subscription-name', subscription.name);
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
            target.find('tbody > tr').on('click', function (e) {
                var activeBusColumn = new ActiveBusColumn();
                activeBusColumn.hash = $(e.currentTarget).data('hash');
                activeBusColumn.subscription = new ActiveBusSubscriptionColumn($(e.currentTarget).data('topic-name'), $(e.currentTarget).data('subscription-name'));
                _this.eventHandler.trigger("ActivateBusColumn", activeBusColumn);
            });
        }
    };
    return BusSubscriptionCallbackHandler;
}());
//# sourceMappingURL=ServiceBusMonitor.js.map