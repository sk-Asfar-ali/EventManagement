// src/events/event.entity.ts
import { Attendance } from 'src/attendance/attendance.entity';
import { Organizer } from 'src/organizers/organizer.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Report } from 'src/reports/reports.entity';
@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  location: string;

  @Column()
  event_date: Date;

  @Column()
  capacity: number;

  @ManyToOne(() => Organizer, organizer => organizer.events, { onDelete: 'CASCADE' })
  organizer: Organizer;

  @OneToMany(() => Attendance, attendance => attendance.event)
  attendances: Attendance[];

  @OneToMany(() => Report, report => report.event)
  reports: Report[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
