// src/reports/report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

import { Event } from '../events/events.entity';
import { User } from 'src/users/users.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.reports, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Event, event => event.reports, { onDelete: 'CASCADE' })
  event: Event;

  @Column('text')
  reason: string;

  @Column({ type: 'enum', enum: ['pending', 'reviewed', 'resolved'], default: 'pending' })
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
