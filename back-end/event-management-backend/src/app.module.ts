import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { OrganizersModule } from './organizers/organizers.module';
import { EventsModule } from './events/events.module';
import { RegistrationModule } from './registration/registration.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: 
  
  [
     ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: +process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'your_password',
      database: process.env.DB_NAME || 'event_management',
      autoLoadEntities: true,
      synchronize: true, // ❗ false in production
    }),
    UsersModule, OrganizersModule, EventsModule, RegistrationModule, AttendanceModule, NotificationsModule, ReportsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
