import { User } from '../users/users.entity';
import { Registration } from '../registration/registration.entity';
import { Attendance } from '../attendance/attendance.entity';
import { Report } from '../reports/reports.entity';
import { Notification } from '../notifications/notifications.entity';
export declare class Event {
    id: number;
    title: string;
    description: string;
    venue: string;
    eventDate: Date;
    registrationClosingDate: Date;
    durationInHours: number;
    creator: User;
    registrations: Registration[];
    attendances: Attendance[];
    reports: Report[];
    notifications: Notification[];
    createdAt: Date;
    updatedAt: Date;
}
