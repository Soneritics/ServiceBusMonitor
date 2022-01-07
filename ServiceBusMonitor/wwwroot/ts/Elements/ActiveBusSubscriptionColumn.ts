class ActiveBusSubscriptionColumn {
    topicName: string;
    subscriptionName: string;

    constructor(topicName: string, subscriptionName: string) {
        this.topicName = topicName;
        this.subscriptionName = subscriptionName;
    }
}