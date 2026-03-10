import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './users.entity';
import { Event } from '../events/events.entity';
import { Registration } from '../registration/registration.entity';
import { RegistrationStatus } from '../registration/registration.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,

    private readonly notificationsService: NotificationsService,
  ) {}

  // Create User
  async create(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  // Find user by email
  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  // Find user by id
  async findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }
<<<<<<< HEAD
=======

  async getEventsForUser(userId: number) {
    const events = await this.eventRepository.find({
      order: { eventDate: 'ASC' },
    });
>>>>>>> ded85c15aaca68acee1d12d2ead1c073b08b54be

  // Get events with user status
  async getEventsForUser(userId: number) {
    const [events, registrations] = await Promise.all([
      this.eventRepo.find({
        order: { eventDate: 'ASC' },
      }),
      this.registrationRepo.find({
        where: {
          user: { id: userId },
          status: RegistrationStatus.REGISTERED,
        },
        relations: ['event'],
      }),
    ]);

<<<<<<< HEAD
    const registeredEventIds = new Set(
      registrations.map((r) => r.event.id),
    );

=======
    const registeredEventIds = registrations.map((r) => r.event.id);
>>>>>>> ded85c15aaca68acee1d12d2ead1c073b08b54be
    const now = new Date();

    return events.map((event) => {
      const eventDate = new Date(event.eventDate);

<<<<<<< HEAD
      if (eventDate <= now) {
        return {
          ...event,
          status: 'CLOSED',
          canCancel: false,
        };
      }

      const isRegistered = registeredEventIds.has(event.id);

      if (!isRegistered) {
        return {
          ...event,
          status: 'NOT_REGISTERED',
          canCancel: false,
        };
      }

      const hoursDifference =
        (eventDate.getTime() - now.getTime()) /
        (1000 * 60 * 60);

      return {
        ...event,
        status: 'REGISTERED',
        canCancel: hoursDifference >= 24,
=======
      // Fields shared across all status shapes — venue and durationInHours
      // were previously omitted, causing them to show as blank on the frontend.
      const base = {
        id: event.id,
        title: event.title,
        description: event.description,
        eventDate: event.eventDate,
        venue: event.venue,
        durationInHours: event.durationInHours,
        registrationClosingDate: event.registrationClosingDate,
>>>>>>> ded85c15aaca68acee1d12d2ead1c073b08b54be
      };

      if (eventDate <= now) {
        return { ...base, status: 'CLOSED', canCancel: false };
      }

      if (!isRegistered) {
        return { ...base, status: 'NOT_REGISTERED', canCancel: false };
      }

      const hoursDifference =
        (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      return { ...base, status: 'REGISTERED', canCancel: hoursDifference >= 24 };
    });
  }

  // Register user to event
  async registerToEvent(userId: number, eventId: number) {
    const event = await this.eventRepo.findOne({
      where: { id: eventId },
      relations: ['creator'],
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.registrationClosingDate <= new Date()) {
      throw new BadRequestException('Registration closed');
    }

    const existing = await this.registrationRepo.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
        status: RegistrationStatus.REGISTERED,
      },
    });

    if (existing) {
      throw new BadRequestException('Already registered');
    }

<<<<<<< HEAD
    const registration = this.registrationRepo.create({
=======
    const registration = this.registrationRepository.create({
>>>>>>> ded85c15aaca68acee1d12d2ead1c073b08b54be
      user: { id: userId },
      event: { id: eventId },
      status: RegistrationStatus.REGISTERED,
    });

    const saved = await this.registrationRepo.save(registration);

    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      const message = `${user?.name || 'A user'} registered for your event: ${event.title}`;

      if (event.creator?.id) {
        await this.notificationsService.createNotification(
          event.creator.id,
          message,
          event.id,
        );
      }
    } catch (error) {
      console.error('Notification error:', error);
    }

    return saved;
  }

<<<<<<< HEAD
  // Cancel event registration
  async cancelRegistration(userId: number, eventId: number) {
    const registration = await this.registrationRepo.findOne({
=======
  // =========================================
  // 3️⃣ Cancel Registration
  // =========================================
  async cancelRegistration(userId: number, eventId: number) {
    const registration = await this.registrationRepository.findOne({
>>>>>>> ded85c15aaca68acee1d12d2ead1c073b08b54be
      where: {
        user: { id: userId },
        event: { id: eventId },
        status: RegistrationStatus.REGISTERED,
      },
      relations: ['event', 'event.creator'],
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    const eventDate = new Date(registration.event.eventDate);
<<<<<<< HEAD
    const now = new Date();

=======
>>>>>>> ded85c15aaca68acee1d12d2ead1c073b08b54be
    const hoursDifference =
      (eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      throw new BadRequestException('Cannot cancel within 24 hours of event');
    }

    registration.status = RegistrationStatus.CANCELLED;
<<<<<<< HEAD

    const saved = await this.registrationRepo.save(registration);
=======
    const saved = await this.registrationRepository.save(registration);
>>>>>>> ded85c15aaca68acee1d12d2ead1c073b08b54be

    try {
      const user = await this.userRepo.findOne({
        where: { id: userId },
      });

      const message = `${user?.name || 'A user'} cancelled registration for your event: ${registration.event.title}`;
<<<<<<< HEAD

      if (registration.event.creator?.id) {
        await this.notificationsService.createNotification(
          registration.event.creator.id,
          message,
          registration.event.id,
=======
      if (registration.event?.creator?.id) {
        await this.notificationsService?.createNotification(
          registration.event.creator.id, message, registration.event.id,
>>>>>>> ded85c15aaca68acee1d12d2ead1c073b08b54be
        );
      }
    } catch (error) {
      console.error('Notification error:', error);
    }

    return saved;
  }

  // Get my registered events
  async getMyEvents(userId: number) {
    const registrations = await this.registrationRepo.find({
      where: {
        user: { id: userId },
        status: RegistrationStatus.REGISTERED,
      },
      relations: ['event'],
    });

    return registrations.map((r) => ({
      id: r.event.id,
      title: r.event.title,
      description: r.event.description,
      eventDate: r.event.eventDate,
      status: 'REGISTERED',
      canCancel: true,
    }));
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { resetToken: token } });
  }
}