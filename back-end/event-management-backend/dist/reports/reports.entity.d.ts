import { User } from '../users/users.entity';
import { Event } from '../events/events.entity';
export declare class Report {
    id: number;
    content: string;
    driveLink: string;
    user: User;
    event: Event;
    createdAt: Date;
}
