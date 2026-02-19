import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../events/events.entity';
import { Registration } from 'src/registration/registration.entity';
import { Attendance } from 'src/attendance/attendance.entity';
import { Report } from 'src/reports/reports.entity';
import { Notification } from 'src/notifications/notifications.entity';
export enum Role {
  USER = 'user',
  ORGANIZER = 'organizer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @OneToMany(() => Event, (event) => event.creator)
  events: Event[];

  // Registered Events
  @OneToMany(() => Registration, (registration) => registration.user)
  registrations: Registration[];

  // Attendance Records
  @OneToMany(() => Attendance, (attendance) => attendance.user)
  attendances: Attendance[];

  // Reports
  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  // Notifications
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];



}
