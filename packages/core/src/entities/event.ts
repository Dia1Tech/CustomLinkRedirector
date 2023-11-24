export interface Event {
    eventHash?: string;
    eventId?: string;
    createdAt?: number;
    evt: any;
    statusCode: number;
    response: any;
}

export interface IEventAdapter {
    registerAPIEvent(event: Event): Promise<void>
}