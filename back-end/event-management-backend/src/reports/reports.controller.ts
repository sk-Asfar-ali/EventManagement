import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/users.entity';

@Controller('organizer/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ORGANIZER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getDashboard(@Request() req) {
    // BUG FIX: was (req as any).users.id — JWT guard populates req.user (singular)
    return this.reportsService.getDashboardData(req.user.id);
  }

  @Get(':id')
  async getEventDetails(
    @Param('id', ParseIntPipe) eventId: number,
    @Request() req,
  ) {
    return this.reportsService.getEventDetails(eventId, req.user.id);
  }
}

