import { EventsService } from './events.service';
export declare class EventsController {
    private eventService;
    constructor(eventService: EventsService);
    create(body: any, req: any): Promise<import("./events.entity").Event[]>;
    findAll(req: any): Promise<import("./events.entity").Event[]>;
    update(id: number, body: any, req: any): Promise<import("./events.entity").Event>;
}
