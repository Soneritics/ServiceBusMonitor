class ServiceBusOptions {
    activeBus: string;
    containers: Containers;
    endpoints: Endpoints;

    constructor(activeBus : string, endpoints: Endpoints, containers?: Containers) {
        this.activeBus = activeBus;
        this.endpoints = endpoints;
        this.containers = containers ?? new Containers();
    }
}