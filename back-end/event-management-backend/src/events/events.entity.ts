// src/events/event.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.events, { eager: true })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;
}

  // @ManyToOne(() => Organizer, organizer => organizer.events, { onDelete: 'CASCADE' })
  // organizer: Organizer;

  // @OneToMany(() => Attendance, attendance => attendance.event)
  // attendances: Attendance[];

  // @OneToMany(() => Report, report => report.event)
  // reports: Report[];

  // @CreateDateColumn()
  // created_at: Date;

  // @UpdateDateColumn()
  // updated_at: Date;

