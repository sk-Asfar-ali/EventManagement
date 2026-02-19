import { User } from '../users/users.entity';
import { Event } from '../events/events.entity';
export declare class Notification {
    id: number;
    message: string;
    isRead: boolean;
    user: User;
    event: Event;
    createdAt: Date;
}
