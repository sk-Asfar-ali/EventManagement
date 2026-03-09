import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Registration } from '../registration/registration.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Report } from '../reports/reports.entity';
import { Notification } from '../notifications/notifications.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column()
  venue!: string;

  @Column({ type: 'datetime' })
  eventDate!: Date;


  @Column({ type: 'datetime' })
  registrationClosingDate!: Date;

 
  @Column({ type: 'int' })
  durationInHours!: number;

  // Created by organizer/user
  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'creator_id' })
  creator!: User;

  @OneToMany(() => Registration, (registration) => registration.event)
  registrations!: Registration[];

  @OneToMany(() => Attendance, (attendance) => attendance.event)
  attendances!: Attendance[];

  @OneToMany(() => Report, (report) => report.event)
  reports!: Report[];

  @OneToMany(() => Notification, (notification) => notification.event)
  notifications!: Notification[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
