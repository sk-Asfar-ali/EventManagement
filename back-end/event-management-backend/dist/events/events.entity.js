"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const typeorm_1 = require("typeorm");
const users_entity_1 = require("../users/users.entity");
const registration_entity_1 = require("../registration/registration.entity");
const attendance_entity_1 = require("../attendance/attendance.entity");
const reports_entity_1 = require("../reports/reports.entity");
const notifications_entity_1 = require("../notifications/notifications.entity");
let Event = class Event {
    id;
    title;
    description;
    venue;
    eventDate;
    registrationClosingDate;
    durationInHours;
    creator;
    registrations;
    attendances;
    reports;
    notifications;
    createdAt;
    updatedAt;
};
exports.Event = Event;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Event.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Event.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Event.prototype, "venue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Event.prototype, "eventDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Event.prototype, "registrationClosingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Event.prototype, "durationInHours", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.events),
    (0, typeorm_1.JoinColumn)({ name: 'creator_id' }),
    __metadata("design:type", users_entity_1.User)
], Event.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => registration_entity_1.Registration, (registration) => registration.event),
    __metadata("design:type", Array)
], Event.prototype, "registrations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => attendance_entity_1.Attendance, (attendance) => attendance.event),
    __metadata("design:type", Array)
], Event.prototype, "attendances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reports_entity_1.Report, (report) => report.event),
    __metadata("design:type", Array)
], Event.prototype, "reports", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notifications_entity_1.Notification, (notification) => notification.event),
    __metadata("design:type", Array)
], Event.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Event.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Event.prototype, "updatedAt", void 0);
exports.Event = Event = __decorate([
    (0, typeorm_1.Entity)('events')
], Event);
//# sourceMappingURL=events.entity.js.map