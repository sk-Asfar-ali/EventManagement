import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/users.entity'; // adjust path if Role is exported elsewhere

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark-attendance')
  markAttendance(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('eventId', ParseIntPipe) eventId: number,
    @Body('isPresent') isPresent?: boolean,
  ) {
    return this.attendanceService.markAttendance(userId, eventId, isPresent);
  }

  @Get('event/:eventId')
  getEventAttendance(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.attendanceService.getEventAttendance(eventId);
  }

  @Get('user/:userId')
  getUserAttendance(@Param('userId', ParseIntPipe) userId: number) {
    return this.attendanceService.getUserAttendance(userId);
  }

  @Patch(':attendanceId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ORGANIZER) // was @Roles('organizer')
  updateAttendance(
    @Param('attendanceId', ParseIntPipe) attendanceId: number,
    @Body('status', ParseBoolPipe) status: boolean,
  ) {
    return this.attendanceService.updateAttendance(attendanceId, status);
  }
}