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

  async findAll(user: User) {
    if (user.role === Role.ORGANIZER) {
      return this.eventRepo.find();
    }

    return this.eventRepo.find({
      where: { creator: { id: user.id } },
    });
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
}
