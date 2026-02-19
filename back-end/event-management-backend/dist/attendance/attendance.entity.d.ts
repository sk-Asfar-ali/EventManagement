import { User } from '../users/users.entity';
import { Event } from '../events/events.entity';
export declare class Attendance {
    id: number;
    user: User;
    event: Event;
    isPresent: boolean;
}
