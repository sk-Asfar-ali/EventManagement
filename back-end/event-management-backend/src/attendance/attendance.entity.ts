// src/attendance/attendance.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';

// import { Event } from '../events/events.entity';
// import { User } from 'src/users/users.entity';

// @Entity('attendance')
// export class Attendance {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => User, user => user.attendances, { onDelete: 'CASCADE' })
//   user: User;

//   @ManyToOne(() => Event, event => event.attendances, { onDelete: 'CASCADE' })
//   event: Event;

//   @Column({ type: 'enum', enum: ['registered', 'cancelled', 'attended'], default: 'registered' })
//   status: string;

//   @CreateDateColumn()
//   registered_at: Date;
// }
