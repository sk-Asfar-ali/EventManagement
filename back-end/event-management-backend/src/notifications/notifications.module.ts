import { Module } from '@nestjs/common';
import { Notification } from './notifications.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports:[TypeOrmModule.forFeature([Notification])],
    exports:[TypeOrmModule]
})
export class NotificationsModule {}
