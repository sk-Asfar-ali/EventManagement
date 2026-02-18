import { Event } from '../events/events.entity';
export declare enum Role {
    USER = "user",
    ORGANIZER = "organizer"
}
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
    events: Event[];
}
