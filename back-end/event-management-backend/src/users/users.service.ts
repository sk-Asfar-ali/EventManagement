import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './users.entity';
import { Event } from '../events/events.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Registration } from 'src/registration/registration.entity';
import { RegistrationStatus } from 'src/registration/registration.entity';
import { EventWithUserStatusDto, UserEventStatus } from './dto/event-with-user-status.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,

    @InjectRepository(Registration)
    private readonly registrationRepository: Repository<Registration>,
    private readonly notificationsService: NotificationsService,
  ) {}

  create(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }
async getEventsForUser(userId: number) {
    const events = await this.eventRepository.find({
      order: { eventDate: 'ASC' },
    });

    const registrations = await this.registrationRepository.find({
      where: {
        user: { id: userId },
        status: RegistrationStatus.REGISTERED,
      },
      relations: ['event'],
    });

    const registeredEventIds = registrations.map(
      (r) => r.event.id,
    );

    const now = new Date();

    return events.map((event) => {
      const eventDate = new Date(event.eventDate);
      const isRegistered = registeredEventIds.includes(event.id);

      if (eventDate <= now) {
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          status: 'CLOSED',
          canCancel: false,
        };
      }

      if (!isRegistered) {
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          eventDate: event.eventDate,
          status: 'NOT_REGISTERED',
          canCancel: false,
        };
      }

      const hoursDifference =
        (eventDate.getTime() - now.getTime()) /
        (1000 * 60 * 60);

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        status: 'REGISTERED',
        canCancel: hoursDifference >= 24,
      };
    });
  }

  // =========================================
  // 2️⃣ Register To Event
  // =========================================
  async registerToEvent(userId: number, eventId: number) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['creator'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Use registrationClosingDate instead of eventDate
    if (event.registrationClosingDate <= new Date()) {
      throw new BadRequestException(
        'Registration closed',
      );
    }

    const existing = await this.registrationRepository.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
        status: RegistrationStatus.REGISTERED,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Already registered',
      );
    }

    const registration =
      this.registrationRepository.create({
        user: { id: userId },
        event: { id: eventId },
        status: RegistrationStatus.REGISTERED,
      });

    const saved = await this.registrationRepository.save(registration);

    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      const message = `${user?.name || 'A user'} registered to your event: ${event.title}`;
      if (event?.creator?.id) {
        await this.notificationsService?.createNotification(event.creator.id, message, event.id);
      }
    } catch (e) {}

    return saved;
  }

  // =========================================
  // 3️⃣ Cancel Registration
  // =========================================
  async cancelRegistration(
    userId: number,
    eventId: number,
  ) {
    const registration =
      await this.registrationRepository.findOne({
        where: {
          user: { id: userId },
          event: { id: eventId },
          status: RegistrationStatus.REGISTERED,
        },
        relations: ['event', 'event.creator'],
      });

    if (!registration) {
      throw new NotFoundException(
        'Registration not found',
      );
    }

    const eventDate = new Date(
      registration.event.eventDate,
    );
    const now = new Date();

    const hoursDifference =
      (eventDate.getTime() - now.getTime()) /
      (1000 * 60 * 60);

    if (hoursDifference < 24) {
      throw new BadRequestException(
        'Cannot cancel within 24 hours of event',
      );
    }

    registration.status =
      RegistrationStatus.CANCELLED;

    const saved = await this.registrationRepository.save(registration);

    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      const message = `${user?.name || 'A user'} cancelled registration for your event: ${registration.event.title}`;
      if (registration.event?.creator?.id) {
        await this.notificationsService?.createNotification(registration.event.creator.id, message, registration.event.id);
      }
    } catch (e) {}

    return saved;
  }

  // =========================================
  // 4️⃣ My Registered Events
  // =========================================
  async getMyEvents(userId: number) {
    return this.registrationRepository.find({
      where: {
        user: { id: userId },
        status: RegistrationStatus.REGISTERED,
      },
      relations: ['event'],
    });
  }
}