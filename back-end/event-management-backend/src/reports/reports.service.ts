import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from '../events/events.entity';
import { Registration, RegistrationStatus } from '../registration/registration.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Report } from '../reports/reports.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,

    @InjectRepository(Registration)
    private registrationRepo: Repository<Registration>,

    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,

    @InjectRepository(Report)
    private reportRepo: Repository<Report>,
  ) {}


  async getDashboardData(organizerId: number) {
    // KPI Section 
    const totalEvents = await this.eventRepo.count({
      where: { creator: { id: organizerId } },
    });

    const totalRegistrations = await this.registrationRepo
      .createQueryBuilder('r')
      .leftJoin('r.event', 'e')
      .where('e.creator_id = :organizerId', { organizerId })
      .andWhere('r.status = :status', { status: 'registered' })
      .getCount();

    const totalPresent = await this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoin('a.event', 'e')
      .where('e.creator_id = :organizerId', { organizerId })
      .andWhere('a.isPresent = 1')
      .getCount();

    const upcomingEvents = await this.eventRepo
      .createQueryBuilder('e')
      .where('e.creator_id = :organizerId', { organizerId })
      .andWhere('e.eventDate > NOW()')
      .getCount();

    // Event Cards Section 

    const eventsRaw = await this.eventRepo
      .createQueryBuilder('e')
      .leftJoin('e.registrations', 'r')
      .leftJoin('e.attendances', 'a')
      .where('e.creator_id = :organizerId', { organizerId })
      .select([
        'e.id AS id',
        'e.title AS title',
        'e.venue AS venue',
        'e.eventDate AS eventDate',
        'COUNT(DISTINCT r.id) AS totalRegistrations',
        'COUNT(DISTINCT CASE WHEN a.isPresent = 1 THEN a.id END) AS presentCount',
      ])
      .groupBy('e.id')
      .orderBy('e.eventDate', 'DESC')
      .getRawMany();

    const events = eventsRaw.map((event) => {
      const totalRegs = Number(event.totalRegistrations);
      const present = Number(event.presentCount);

      const attendanceRate =
        totalRegs > 0
          ? Number(((present / totalRegs) * 100).toFixed(1))
          : 0;

      return {
        id: event.id,
        title: event.title,
        venue: event.venue,
        eventDate: event.eventDate,
        totalRegistrations: totalRegs,
        presentCount: present,
        attendanceRate,
      };
    });

    return {
      dashboard: {
        totalEvents,
        totalRegistrations,
        totalPresent,
        upcomingEvents,
      },
      events,
    };
  }

  async getEventDetails(eventId: number, organizerId: number) {
    // Event Info
    const event = await this.eventRepo.findOne({
      where: { id: eventId, creator: { id: organizerId } },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const totalRegistered = await this.registrationRepo.count({
      where: {
        event: { id: eventId },
        status: RegistrationStatus.REGISTERED
      },
    });

    const totalCancelled = await this.registrationRepo.count({
      where: {
        event: { id: eventId },
        status: RegistrationStatus.CANCELLED
      },
    });

    const totalPresent = await this.attendanceRepo.count({
      where: {
        event: { id: eventId },
        isPresent: true,
      },
    });

    const totalAbsent = totalRegistered - totalPresent;

    const attendanceRate =
      totalRegistered > 0
        ? Number(((totalPresent / totalRegistered) * 100).toFixed(1))
        : 0;

    // Registration Trend (Line Chart) 

    const registrationTrend = await this.registrationRepo
      .createQueryBuilder('r')
      .select('DATE(r.registeredAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('r.event_id = :eventId', { eventId })
      .andWhere('r.status = :status', { status: 'registered' })
      .groupBy('DATE(r.registeredAt)')
      .orderBy('DATE(r.registeredAt)', 'ASC')
      .getRawMany();

    // Attendance Breakdown (Pie Chart)

    const attendanceBreakdown = {
      present: totalPresent,
      absent: totalAbsent,
    };

    //  Reports Submitted

    const reports = await this.reportRepo.find({
      where: { event: { id: eventId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      event,
      stats: {
        totalRegistered,
        totalCancelled,
        totalPresent,
        totalAbsent,
        attendanceRate,
      },
      registrationTrend,
      attendanceBreakdown,
      reports,
    };
  }
}
