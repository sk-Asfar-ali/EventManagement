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
import {
  Registration,
  RegistrationStatus,
} from '../registration/registration.entity';

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

  // ─── 1) Mark / Update Attendance ────────────────────────────────────────────
  // Called by organizer. Allows marking present OR absent on the event day
  // or any time after the event has started (organizers often mark attendance
  // retrospectively once the event ends).
  async markAttendance(userId: number, eventId: number, isPresent?: boolean) {
    if (!userId || !eventId) {
      throw new BadRequestException('userId and eventId are required');
    }

    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Only REGISTERED (not cancelled) attendees can have attendance marked
    const registration = await this.registrationRepo.findOne({
      where: {
        user: { id: userId },
        event: { id: eventId },
        status: RegistrationStatus.REGISTERED,
      },
    });

    if (!registration) {
      throw new BadRequestException('User is not registered for this event');
    }

    // Allow marking on the event day OR after it has started
    // (organizers may mark attendance after the event ends)
    const eventDate = new Date(event.eventDate);
    const now = new Date();

    // Strip time: compare calendar dates
    const eventDay = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
    );
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (eventDay > today) {
      throw new BadRequestException(
        'Attendance can only be marked on or after the event date',
      );
    }

    // Upsert: update if record exists, insert if not
    const existing = await this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoin('a.user', 'u')
      .leftJoin('a.event', 'e')
      .where('u.id = :userId', { userId })
      .andWhere('e.id = :eventId', { eventId })
      .getOne();

    const row = existing ?? this.attendanceRepo.create();
    row.user = { id: userId } as User;
    row.event = { id: eventId } as Event;
    // BUG FIX: was hardcoded to `true` — now uses the value sent by the caller
    row.isPresent = isPresent !== undefined ? isPresent : true;

    const saved = await this.attendanceRepo.save(row);

    return {
      message: existing ? 'Attendance updated' : 'Attendance marked',
      data: saved,
    };
  }

  // ─── 2) Get Attendance by Event ─────────────────────────────────────────────
  async getEventAttendance(eventId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');

    // Only count REGISTERED (not cancelled) attendees
    const totalRegistered = await this.registrationRepo.count({
      where: { event: { id: eventId }, status: RegistrationStatus.REGISTERED },
    });

    // Join registrations → users → attendance so every registered user appears
    // even if they have no attendance record yet (LEFT JOIN on attendance).
    const rows = await this.registrationRepo
      .createQueryBuilder('r')
      .innerJoin('r.user', 'u')
      .leftJoin(Attendance, 'a', 'a.user_id = u.id AND a.event_id = r.event_id')
      .where('r.event_id = :eventId', { eventId })
      .andWhere('r.status = :status', { status: RegistrationStatus.REGISTERED })
      .select([
        'u.id       AS userId',
        'u.name     AS name',
        'u.email    AS email',
        // Cast to bit/bool so it comes back consistently across DB engines.
        // COALESCE returns 0 (absent by default) when no attendance row exists.
        'CAST(COALESCE(a.isPresent, 0) AS UNSIGNED) AS isPresent',
      ])
      .getRawMany();

    // Normalise isPresent to a real JS boolean regardless of DB driver quirks
    // (MySQL raw queries can return 0/1, "0"/"1", true/false, Buffer, etc.)
    const users = rows.map((r) => ({
      userId: Number(r.userId),
      name: r.name,
      email: r.email,
      isPresent: this.toBoolean(r.isPresent),
    }));

    const totalPresent = users.filter((u) => u.isPresent).length;
    const totalAbsent = Math.max(totalRegistered - totalPresent, 0);

    return { eventId, totalRegistered, totalPresent, totalAbsent, users };
  }

  // ─── 3) Get Attendance by User ───────────────────────────────────────────────
  async getUserAttendance(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Count only REGISTERED (not cancelled) registrations as the denominator
    const totalRegistered = await this.registrationRepo.count({
      where: { user: { id: userId }, status: RegistrationStatus.REGISTERED },
    });

    const presentRows = await this.attendanceRepo.find({
      where: { isPresent: true, user: { id: userId } },
      relations: ['event'],
    });

    const totalPresent = presentRows.length;
    const eventsMissed = Math.max(totalRegistered - totalPresent, 0);
    const attendancePercentage =
      totalRegistered === 0
        ? 0
        : Number(((totalPresent / totalRegistered) * 100).toFixed(2));

    const eventsAttended = presentRows.map((row) => ({
      eventId: row.event?.id ?? null,
      title: row.event?.title ?? null,
      date: row.event?.eventDate ?? null,
    }));

    return { userId, eventsAttended, eventsMissed, attendancePercentage };
  }

  // ─── 4) Update Attendance by attendanceId (Organizer only) ──────────────────
  async updateAttendance(attendanceId: number, status: boolean) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id: attendanceId },
    });
    if (!attendance) throw new NotFoundException('Attendance record not found');

    attendance.isPresent = status;
    const saved = await this.attendanceRepo.save(attendance);

    return { message: 'Attendance status updated', data: saved };
  }

  // ─── Helper ──────────────────────────────────────────────────────────────────
  // MySQL raw queries can return booleans as: true/false, 1/0, "1"/"0",
  // Buffer([1])/Buffer([0]) depending on driver version. Normalise them all.
  private toBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') return value;
    if (Buffer.isBuffer(value)) return value[0] === 1;
    return Number(value) === 1;
  }
}
