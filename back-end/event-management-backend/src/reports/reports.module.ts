import { Module } from '@nestjs/common';
import { Report } from './reports.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { Event } from '../events/events.entity';
import { Registration } from '../registration/registration.entity';
import { Attendance } from '../attendance/attendance.entity';
import { ReportsController } from './reports.controller';

@Module({
  imports:[TypeOrmModule.forFeature([Report,Event,Registration,Attendance])],
    exports:[TypeOrmModule],
    providers: [ReportsService],
    controllers: [ReportsController]

})
export class ReportsModule {}