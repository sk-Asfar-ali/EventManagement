// src/users/user.entity.ts
import { Attendance } from 'src/attendance/attendance.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
// import { Attendance } from '../attendance/attendance.entity';
import { Report } from '../reports/reports.entity';
import { Notification } from '../notifications/notifications.entity';

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

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Attendance, attendance => attendance.user)
  attendances: Attendance[];

  @OneToMany(() => Report, report => report.user)
  reports: Report[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
