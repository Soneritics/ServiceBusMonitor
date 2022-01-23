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
        // Fetch Application Insights data
        this.eventHandler.on('ShowApplicationInsightsData', function (enqueuedDateTime) { return _this.showApplicationInsightsData(enqueuedDateTime); });
        // Load or reload the DLQ messages
        this.eventHandler.on('LoadDeadletterQueueMessages', function () { return _this.loadDeadletterQueueMessages(); });
        // Process actions on a queue message
        this.eventHandler.on('ProcessActions', function (actionData) { return _this.processActions(actionData); });
    };
    ServiceBusMonitor.prototype.activateBusColumn = function (column) {
        this.ui.reset();
        // Determine the active bus column
        // If an inactive column is clicked, make it active.
        // If an active column is clicked, make it inactive.
        this.activeBusColumn = this.activeBusColumn === null || this.activeBusColumn.hash !== column.hash
            ? column
            : null;
        // Trigger the UI event to activate the correct column
        this.eventHandler.trigger("ActivateActiveBusColumnInInterface", $("body"));
        // Load the deadletter queue messages
        if (this.activeBusColumn) {
            this.eventHandler.trigger("LoadDeadletterQueueMessages");
        }
    };
    ServiceBusMonitor.prototype.loadDeadletterQueueMessages = function () {
        this.ui.loadDeadletterQueueMessages(this.activeBusColumn);
    };
    ServiceBusMonitor.prototype.activateActiveBusColumnInInterface = function (selector) {
        this.ui.activateActiveBusColumnInInterface(selector, this.activeBusColumn);
    };
    ServiceBusMonitor.prototype.showApplicationInsightsData = function (enqueuedDateTime) {
        this.ui.showApplicationInsightsData(enqueuedDateTime);
    };
    ServiceBusMonitor.prototype.processActions = function (actionData) {
        (new SaveAction()).process(actionData, this.activeBusColumn, this.options);
        (new ResubmitAction(this.eventHandler)).process(actionData, this.activeBusColumn, this.options);
        (new DeleteAction(this.eventHandler)).process(actionData, this.activeBusColumn, this.options);
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
    function ServiceBusOptions(activeBus, endpoints, containers) {
        this.activeBus = activeBus;
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
        (new Loader("#" + this.options.containers.lastUpdate, this.options.endpoints.lastUpdate, 10000)).start();
        // Reload the service bus queues
        var queueReloader = new Loader("#" + this.options.containers.queues, this.options.endpoints.queues, 5000, false);
        queueReloader.callbackHandler = new BusQueueCallbackHandler("#" + this.options.containers.queues, this.eventHandler);
        queueReloader.start();
        // Reload the service bus topics and subscriptions
        var subscriptionReloader = new Loader("#" + this.options.containers.topics, this.options.endpoints.topics, 5000, false);
        subscriptionReloader.callbackHandler = new BusSubscriptionCallbackHandler("#" + this.options.containers.topics, this.eventHandler);
        subscriptionReloader.start();
    };
    /**
     * Activate the active bus column in the interface, in a given scope.
     * @param scope A JQuery selector to find for the row to 'activate'.
     * @param activeBusColumn
     */
    UI.prototype.activateActiveBusColumnInInterface = function (scope, activeBusColumn) {
        scope.find('.active-bus-line').removeClass('active-bus-line');
        if (activeBusColumn) {
            $(scope).find('tr[data-hash="' + activeBusColumn.hash + '"]').addClass('active-bus-line');
        }
    };
    /**
     * Load the dead letter queue messages.
     * @param activeBusColumn
     */
    UI.prototype.loadDeadletterQueueMessages = function (activeBusColumn) {
        var dlqContainer = '#' + this.options.containers.deadletterMessages;
        $(dlqContainer).show();
        var selector = dlqContainer + " .holder-content";
        var data = (new DeadLetterQueuePostDataParser()).parse(this.options, activeBusColumn);
        var url = activeBusColumn.queue
            ? this.options.endpoints.dlqMessagesOnQueue
            : this.options.endpoints.dlqMessagesOnTopic;
        var loader = new Loader(selector, url, 0, true, false);
        loader.callbackHandler = new DlqMessagesCallbackHandler(selector, this.eventHandler);
        loader.start(data);
    };
    /**
     * Load Application Insights data based on a timestamp of which the message was enqueued.
     * @param enqueuedDateTime
     */
    UI.prototype.showApplicationInsightsData = function (enqueuedDateTime) {
        var aiContainer = '#' + this.options.containers.applicationInsights;
        $(aiContainer).show();
        var selector = aiContainer + " .holder-content";
        var url = this.options.endpoints.exceptionLogs;
        var data = {
            busName: this.options.activeBus,
            dateTime: enqueuedDateTime
        };
        var loader = new Loader(selector, url, 0, true, false);
        loader.callbackHandler = new GenericTableBuilderCallbackHandler(selector, "No logs found.");
        loader.start(data);
    };
    return UI;
}());
var ActionData = /** @class */ (function () {
    function ActionData(container, message) {
        this.container = container;
        this.message = message;
    }
    return ActionData;
}());
var DeleteAction = /** @class */ (function () {
    function DeleteAction(eventHandler) {
        this.eventHandler = eventHandler;
    }
    DeleteAction.prototype.process = function (actionData, activeBusColumn, options) {
        var _this = this;
        var deleteAction = $('<a href="javascript:;" class="btn btn-primary btn-xs px-2 mr-2" title="Delete message"><i class="fas fa-trash-alt"></i></a>');
        deleteAction.on('click', function (e) {
            $(e.currentTarget).off('click');
            $(e.currentTarget).html('<i class="fas fa-circle-notch fa-spin"></i>');
            var apiBaseUri = "";
            var data = {};
            switch (activeBusColumn.queue ? true : false) {
                case true:
                    apiBaseUri = options.endpoints.actionRemoveDlqMessageFromQueue;
                    data = {
                        busName: options.activeBus,
                        queueName: activeBusColumn.queue.queueName,
                        messageId: actionData.message.id
                    };
                    break;
                default:
                    apiBaseUri = options.endpoints.actionRemoveDlqMessageFromTopicSubscription;
                    data = {
                        busName: options.activeBus,
                        topicName: activeBusColumn.subscription.topicName,
                        subscriptionName: activeBusColumn.subscription.subscriptionName,
                        messageId: actionData.message.id
                    };
                    break;
            }
            $.ajax({
                type: "POST",
                url: apiBaseUri,
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function () {
                    _this.eventHandler.trigger("LoadDeadletterQueueMessages");
                }
            });
            return false;
        });
        actionData.container.append(deleteAction);
    };
    return DeleteAction;
}());
var ResubmitAction = /** @class */ (function () {
    function ResubmitAction(eventHandler) {
        this.eventHandler = eventHandler;
    }
    ResubmitAction.prototype.process = function (actionData, activeBusColumn, options) {
        var _this = this;
        var deleteAction = $('<a href="javascript:;" class="btn btn-primary btn-xs px-2 mr-2" title="Resubmit message"><i class="fas fa-redo"></i></a>');
        deleteAction.on('click', function (e) {
            $(e.currentTarget).off('click');
            $(e.currentTarget).html('<i class="fas fa-circle-notch fa-spin"></i>');
            var apiBaseUri = "";
            var data = {};
            switch (activeBusColumn.queue ? true : false) {
                case true:
                    apiBaseUri = options.endpoints.actionResubmitDlqMessageToQueue;
                    data = {
                        busName: options.activeBus,
                        queueName: activeBusColumn.queue.queueName,
                        messageId: actionData.message.id
                    };
                    break;
                default:
                    apiBaseUri = options.endpoints.actionResubmitDlqMessageToTopicSubscription;
                    data = {
                        busName: options.activeBus,
                        topicName: activeBusColumn.subscription.topicName,
                        subscriptionName: activeBusColumn.subscription.subscriptionName,
                        messageId: actionData.message.id
                    };
                    break;
            }
            $.ajax({
                type: "POST",
                url: apiBaseUri,
                data: JSON.stringify(data),
                contentType: 'application/json',
                success: function () {
                    _this.eventHandler.trigger("LoadDeadletterQueueMessages");
                }
            });
            return false;
        });
        actionData.container.append(deleteAction);
    };
    return ResubmitAction;
}());
var SaveAction = /** @class */ (function () {
    function SaveAction() {
    }
    SaveAction.prototype.process = function (actionData, activeBusColumn, options) {
        var downloadAction = $('<a href="javascript:;" class="btn btn-primary btn-xs px-2 mr-2" alt="Download message"><i class="fas fa-download"></i></a>');
        downloadAction.on('click', function () {
            var blob = new Blob([actionData.message.content], { type: "text/plain;charset=utf-8" });
            saveAs(blob, "msg-" + actionData.message.id + ".json");
            return false;
        });
        actionData.container.append(downloadAction);
    };
    return SaveAction;
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
var DlqMessagesCallbackHandler = /** @class */ (function () {
    function DlqMessagesCallbackHandler(selector, eventHandler) {
        this.selector = selector;
        this.eventHandler = eventHandler;
    }
    DlqMessagesCallbackHandler.prototype.handle = function (messages) {
        var _this = this;
        var table = $('<table class="table table-striped table-hover">' +
            '   <thead>' +
            '       <tr>' +
            '           <th>Enqueued</th>' +
            '           <th>Content</th>' +
            '       </tr>' +
            '   </thead>' +
            '   <tbody></tbody>' +
            '</table>');
        if (messages) {
            messages.forEach(function (message) {
                var tr = $('<tr></tr>');
                tr.attr('data-message-id', message.id);
                tr.attr('data-message-enqueued', message.enqueued);
                var td = $('<td></td>');
                td.text(message.enqueued);
                tr.append(td);
                td = $('<td></td>');
                td.text(message.content);
                var lineActions = $('<div></div>');
                _this.eventHandler.trigger("ProcessActions", new ActionData(lineActions, message));
                td.append(lineActions);
                tr.append(td);
                table.find('tbody').append(tr);
            });
        }
        var target = $(this.selector);
        target.html('');
        target.append(table);
        target.find('tbody > tr').on('click', function (e) {
            target.find('.active-message-line').removeClass('active-message-line');
            $(e.currentTarget).addClass('active-message-line');
            _this.eventHandler.trigger("ShowApplicationInsightsData", $(e.currentTarget).data('message-enqueued'));
        });
    };
    return DlqMessagesCallbackHandler;
}());
var GenericTableBuilderCallbackHandler = /** @class */ (function () {
    function GenericTableBuilderCallbackHandler(selector, noResultsText) {
        this.noResultsText = noResultsText;
        this.selector = selector;
    }
    GenericTableBuilderCallbackHandler.prototype.handle = function (json) {
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
    };
    return GenericTableBuilderCallbackHandler;
}());
var DeadLetterQueuePostDataParser = /** @class */ (function () {
    function DeadLetterQueuePostDataParser() {
    }
    DeadLetterQueuePostDataParser.prototype.parse = function (options, activeBusColumn) {
        if (activeBusColumn.subscription) {
            return this.parseFromSubscription(options, activeBusColumn);
        }
        else {
            return this.parseFromQueue(options, activeBusColumn);
        }
    };
    DeadLetterQueuePostDataParser.prototype.parseFromQueue = function (options, activeBusColumn) {
        return {
            busName: options.activeBus,
            queueName: activeBusColumn.queue.queueName
        };
    };
    DeadLetterQueuePostDataParser.prototype.parseFromSubscription = function (options, activeBusColumn) {
        return {
            busName: options.activeBus,
            topicName: activeBusColumn.subscription.topicName,
            subscriptionName: activeBusColumn.subscription.subscriptionName
        };
    };
    return DeadLetterQueuePostDataParser;
}());
var Loader = /** @class */ (function () {
    function Loader(selector, url, timeout, showLoaderIcon, loop) {
        this.loaderHtml = '<i class="fas fa-circle-notch fa-spin"></i>';
        this.loop = true;
        this.showLoaderIcon = true;
        this.selector = selector;
        this.url = url;
        this.timeout = timeout !== null && timeout !== void 0 ? timeout : 10000;
        this.showLoaderIcon = showLoaderIcon !== null && showLoaderIcon !== void 0 ? showLoaderIcon : true;
        this.loop = loop !== null && loop !== void 0 ? loop : true;
    }
    Loader.prototype.reload = function (data) {
        var _this = this;
        if (this.showLoaderIcon) {
            $(this.selector).html(this.loaderHtml);
        }
        $.get(this.url, data, function (response, status, xhr) {
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
                setTimeout(function () { _this.reload(data); }, _this.timeout);
            }
        });
    };
    Loader.prototype.start = function (data) {
        this.reload(data);
    };
    return Loader;
}());
//# sourceMappingURL=ServiceBusMonitor.js.map