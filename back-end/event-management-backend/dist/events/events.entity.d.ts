import { User } from '../users/users.entity';
export declare class Event {
    id: number;
    title: string;
    description: string;
    creator: User;
    createdAt: Date;
}
