import { Event } from '../events/events.entity';
import { Registration } from 'src/registration/registration.entity';
import { Attendance } from 'src/attendance/attendance.entity';
import { Report } from 'src/reports/reports.entity';
import { Notification } from 'src/notifications/notifications.entity';
export declare enum Role {
    USER = "user",
    ORGANIZER = "organizer"
}
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: Role;
    events: Event[];
    registrations: Registration[];
    attendances: Attendance[];
    reports: Report[];
    notifications: Notification[];
}
