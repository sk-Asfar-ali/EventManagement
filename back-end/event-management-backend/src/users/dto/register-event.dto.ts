import { IsInt, Min } from 'class-validator';

export class RegisterEventDto {
  @IsInt()
  @Min(1)
  eventId: number;
}
