import { RegistrationStatus } from 'src/registration/registration.entity';


export enum UserEventStatus {
  NOT_REGISTERED = 'NOT_REGISTERED',
  REGISTERED = 'REGISTERED',
  CLOSED = 'CLOSED',
}

export class EventWithUserStatusDto {
  id: number;
  title: string;
  description: string;
  eventDate: Date;
  status: UserEventStatus;
  canCancel: boolean;
}
