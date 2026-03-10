import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './events.entity';
import { User, Role } from '../users/users.entity';
import { Registration, RegistrationStatus } from 'src/registration/registration.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(Registration)
    private registrationRepo: Repository<Registration>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(data: any, user: User) {
    const event = this.eventRepo.create({
      ...data,
      creator: user,
    });

    const saved = (await this.eventRepo.save(event) as unknown) as Event;

    try {
      const users = await this.userRepo.find({ where: { role: Role.USER } });
      const message = `${user.name || 'Organizer'} created a new event: ${saved.title}`;
      for (const u of users) {
        await this.notificationsService.createNotification(u.id, message, saved.id);
      }
    } catch (e) {}

    return saved;
  }

  async findAll() {
    return this.eventRepo.find();
  }

  async findById(eventId: number) {
    return this.eventRepo.findOneBy({ id: eventId });
  }

  async deleteById(eventId: number) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['creator'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    try {
      const regs = await this.registrationRepo.find({
        where: { event: { id: eventId }, status: RegistrationStatus.REGISTERED },
        relations: ['user'],
      });
      const message = `${event.creator?.name || 'Organizer'} deleted the event: ${event.title}`;
      for (const r of regs) {
        await this.notificationsService.createNotification(r.user.id, message, eventId);
      }
    } catch (e) {}

    await this.eventRepo.delete(eventId);
    return { message: 'Event deleted successfully' };
  }

  async update(id: number, data: any, user: User) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!event) throw new NotFoundException();

    if (user.role === Role.USER && event.creator.id !== user.id) {
      throw new ForbiddenException('You can only edit your own events');
    }

    Object.assign(event, data);
    const saved = (await this.eventRepo.save(event) as unknown) as Event;

    try {
      const regs = await this.registrationRepo.find({
        where: { event: { id }, status: RegistrationStatus.REGISTERED },
        relations: ['user'],
      });
      const message = `${user.name || 'Organizer'} updated the event: ${saved.title}`;
      for (const r of regs) {
        await this.notificationsService.createNotification(r.user.id, message, saved.id);
      }
    } catch (e) {}

    return saved;
  }

  async findByOrganizerId(id: number) {
    return this.eventRepo.find({
      where: { creator: { id } },
    });
  }

  // ✅ NEW: Returns all REGISTERED attendees for an event, only if the requester owns it
  async getEventRegistrations(eventId: number, requesterId: number) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['creator'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creator.id !== requesterId) {
      throw new ForbiddenException('You can only view registrations for your own events');
    }

    const registrations = await this.registrationRepo.find({
      where: {
        event: { id: eventId },
        status: RegistrationStatus.REGISTERED,
      },
      relations: ['user'],
    });

    return registrations.map(r => ({
      registrationId: r.id,
      status: r.status,
      user: {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
      },
    }));
  }
}