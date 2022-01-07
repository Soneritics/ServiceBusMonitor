class ServiceBusOptions {
    containers: Containers;
    endpoints: Endpoints;

    constructor(endpoints: Endpoints, containers?: Containers) {
        this.endpoints = endpoints;
        this.containers = containers ?? new Containers();
    }
}