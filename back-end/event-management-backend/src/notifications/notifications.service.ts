import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notifications.entity';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectRepository(Notification)
		private readonly notifRepo: Repository<Notification>,
	) {}

	async createNotification(userId: number, message: string, eventId?: number) {
		const n = this.notifRepo.create({
			user: { id: userId } as any,
			message,
			event: eventId ? ({ id: eventId } as any) : null,
		});

		return this.notifRepo.save(n);
	}

	async findForUser(userId: number) {
		return this.notifRepo.find({
			where: { user: { id: userId } },
			order: { createdAt: 'DESC' },
			relations: ['event'],
		});
	}

	async markAsRead(notificationId: number, userId: number) {
		const n = await this.notifRepo.findOne({
			where: { id: notificationId, user: { id: userId } },
		});
		if (!n) return null;
		n.isRead = true;
		return this.notifRepo.save(n);
	}
}
