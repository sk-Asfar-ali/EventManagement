import { IsInt, Min } from 'class-validator';

export class CancelEventDto {
  @IsInt()
  @Min(1)
  eventId: number;
}
