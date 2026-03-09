import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { Request } from 'express';


@Controller('organizer/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getDashboard(@Req() req: Request) {
    const organizerId = (req as any).users.id; // assuming JWT auth
    return this.reportsService.getDashboardData(organizerId);
  }

  @Get(':id')
  async getEventDetails(
    @Param('id', ParseIntPipe) eventId: number,
    @Req() req: Request,
  ) {
    const organizerId = (req as any).users.id;
    return this.reportsService.getEventDetails(eventId, organizerId);
  }
}