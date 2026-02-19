import { Module } from '@nestjs/common';
import { Attendance } from './attendance.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({


    imports:[TypeOrmModule.forFeature([Attendance])],
    exports:[TypeOrmModule]
})
export class AttendanceModule {}
