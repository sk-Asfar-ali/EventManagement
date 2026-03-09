import { Module } from '@nestjs/common';
import { Notification } from './notifications.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
    imports:[TypeOrmModule.forFeature([Notification])],
    exports:[NotificationsService, TypeOrmModule],
    controllers: [NotificationsController],
    providers: [NotificationsService]
})
export class NotificationsModule {}
