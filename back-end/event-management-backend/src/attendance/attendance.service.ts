import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { Event } from '../events/events.entity';
import { User } from '../users/users.entity';
import { Registration } from '../registration/registration.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Registration)
    private readonly registrationRepo: Repository<Registration>,
  ) {}

  private getEventDateValue(event: any): Date | null {
    const candidates = [
      event?.date,
      event?.eventDate,
      event?.startDate,
      event?.event_date,
      event?.start_date,
    ].filter(Boolean);

    if (!candidates.length) return null;
    const d = new Date(candidates[0]);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private isToday(date: Date): boolean {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  // 1) Mark Attendance
  async markAttendance(userId: number, eventId: number, isPresent?: boolean) {
    if (!userId || !eventId) {
      throw new BadRequestException('userId and eventId are required');
    }

    const event = await this.eventRepo.findOne({ where: { id: eventId } as any });
    if (!event) throw new NotFoundException('Event not found');

    const user = await this.userRepo.findOne({ where: { id: userId } as any });
    if (!user) throw new NotFoundException('User not found');

    const registration = await this.registrationRepo
      .createQueryBuilder('r')
      .where('r.user_id = :userId', { userId })
      .andWhere('r.event_id = :eventId', { eventId })
      .getOne();

    if (!registration) {
      throw new BadRequestException('User is not REGISTERED for this event');
    }

    const eventDate = this.getEventDateValue(event);
    if (!eventDate) {
      throw new BadRequestException('Event date field not found in event entity');
    }
    if (!this.isToday(eventDate)) {
      throw new BadRequestException('Attendance can only be marked on event date');
    }

    const existing = await this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoin('a.user', 'u')
      .leftJoin('a.event', 'e')
      .where('u.id = :userId', { userId })
      .andWhere('e.id = :eventId', { eventId })
      .getOne();

    const row: any = existing ?? this.attendanceRepo.create();
    row.user = { id: userId } as any;
    row.event = { id: eventId } as any;

    row.isPresent =  true;

    const saved = await this.attendanceRepo.save(row);

    return {
      message: existing ? 'Attendance updated' : 'Attendance marked',
      data: saved,
    };
  }

  // 2) Get Attendance by Event
  async getEventAttendance(eventId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } as any });
    if (!event) throw new NotFoundException('Event not found');

    const totalRegistered = await this.registrationRepo
      .createQueryBuilder('r')
      .where('r.event_id = :eventId', { eventId })
      .getCount();

    const presentRows = await this.attendanceRepo
      .createQueryBuilder('a')
      .where('a.event_id = :eventId', { eventId })
      .andWhere('a.isPresent = :isPresent', { isPresent: true })
      .getMany();

    const totalPresent = presentRows.length;
    const totalAbsent = Math.max(totalRegistered - totalPresent, 0);

    const users = await this.registrationRepo
      .createQueryBuilder('r')
      .leftJoin(User, 'u', 'u.id = r.user_id')
      .leftJoin(
        Attendance,
        'a',
        'a.user_id = r.user_id AND a.event_id = r.event_id',
      )
      .where('r.event_id = :eventId', { eventId })
      .select([
        'u.id as userId',
        'u.name as name',
        'u.email as email',
        'COALESCE(a.isPresent, false) as isPresent',
      ])
      .getRawMany();

    return {
      eventId,
      totalRegistered,
      totalPresent,
      totalAbsent,
      users,
    };
  }

  // 3) Get Attendance by User

async getUserAttendance(userId: number) {
  const user = await this.userRepo.findOne({ where: { id: userId } as any });
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const totalRegistered = await this.registrationRepo
    .createQueryBuilder('r')
    .where('r.user_id = :userId', { userId })
    .getCount();

  const presentRows = await this.attendanceRepo.find({
    where: {
      isPresent: true,
      user: { id: userId } as any,
    } as any,
    relations: ['event'],
  });

  const totalPresent = presentRows.length;
  const eventsMissed = Math.max(totalRegistered - totalPresent, 0);
  const attendancePercentage =
    totalRegistered === 0
      ? 0
      : Number(((totalPresent / totalRegistered) * 100).toFixed(2));

  const eventsAttended = presentRows.map((row: any) => ({
    eventId: row?.event?.id ?? null,
    title: row?.event?.title ?? null,
    date:
      row?.event?.date ??
      row?.event?.eventDate ??
      row?.event?.startDate ??
      row?.event?.event_date ??
      row?.event?.start_date ??
      null,
  }));

  return {
    userId,
    eventsAttended,
    eventsMissed,
    attendancePercentage,
  };
}


  // 4) Update Attendance (Organizer only - guard in controller)
  async updateAttendance(attendanceId: number, status: boolean) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id: attendanceId } as any,
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    (attendance as any).isPresent = status;
    const saved = await this.attendanceRepo.save(attendance as any);

    return {
      message: 'Attendance status updated',
      data: saved,
    };
  }
}