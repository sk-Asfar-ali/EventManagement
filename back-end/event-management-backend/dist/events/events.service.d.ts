import { Repository } from 'typeorm';
import { Event } from './events.entity';
import { User } from '../users/users.entity';
export declare class EventsService {
    private eventRepo;
    constructor(eventRepo: Repository<Event>);
    create(data: any, user: User): Promise<Event[]>;
    findAll(user: User): Promise<Event[]>;
    update(id: number, data: any, user: User): Promise<Event>;
}
