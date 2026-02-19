import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { ReportsModule } from 'src/reports/reports.module';
import { EventsModule } from 'src/events/events.module';
import { RegistrationModule } from 'src/registration/registration.module';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EventsModule,
    RegistrationModule
  ],
  providers: [UsersService],
  controllers: [UsersController],   // ✅ ADD THIS
  exports: [UsersService],
})
export class UsersModule {}


