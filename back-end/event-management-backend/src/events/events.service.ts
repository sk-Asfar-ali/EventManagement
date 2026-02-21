import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './events.entity';
import { User, Role } from '../users/users.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
  ) {}

  async create(data: any, user: User) {
    const event = this.eventRepo.create({
      ...data,
      creator: user,
    });

    return this.eventRepo.save(event);
  }

  async findAll() {
    
      return this.eventRepo.find();
    
  }

    async findById(eventId: number) {
  return this.eventRepo.findOneBy({ id: eventId });
}


async deleteById(eventId: number) {
  const event = await this.eventRepo.findOneBy({ id: eventId });

  if (!event) {
    throw new NotFoundException('Event not found');
  }

  await this.eventRepo.delete(eventId);

  return {
    message: 'Event deleted successfully'
  };
}

  async update(id: number, data: any, user: User) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!event) throw new NotFoundException();

    if (
      user.role === Role.USER &&
      event.creator.id !== user.id
    ) {
      throw new ForbiddenException(
        'You can only edit your own events',
      );
    }

    Object.assign(event, data);
    return this.eventRepo.save(event);
  }
//   async findEventsByOrganizer(organizerId: number) {
//   return this.eventRepo.find({
//     where: {
//       creator: { id: organizerId },
//     },
//     relations: ['creator'],
//   });
// }

async findByOrganizerId(id: number) {
  return this.eventRepo.find({
    where: { creator: { id } },
  });
}
}
