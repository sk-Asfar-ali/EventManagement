import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { Attendance } from './attendance.entity';
import { Event } from '../events/events.entity';
import { User } from '../users/users.entity';
import { Registration } from '../registration/registration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Event, User, Registration]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
