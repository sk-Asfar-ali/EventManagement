import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Event } from '../events/events.entity';

export enum RegistrationStatus {
  REGISTERED = 'registered',
  CANCELLED = 'cancelled',
}

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.registrations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event, (event) => event.registrations)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.REGISTERED,
  })
  status: RegistrationStatus;

  @CreateDateColumn()
  registeredAt: Date;
}
