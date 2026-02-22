import {
	Controller,
	Get,
	Request,
	UseGuards,
	Patch,
	Param,
	ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@Get()
	async getMyNotifications(@Request() req) {
		return this.notificationsService.findForUser(req.user.id);
	}

	@Patch(':id/read')
	async markRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
		return this.notificationsService.markAsRead(id, req.user.id);
	}
}
