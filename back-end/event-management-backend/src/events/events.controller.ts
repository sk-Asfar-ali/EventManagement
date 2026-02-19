import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';


@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventService: EventsService) {}

  @Post()
  create(@Body() body, @Request() req) {
    return this.eventService.create(body, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.eventService.findAll(req.user);
  }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body,
    @Request() req,
  ) {
    return this.eventService.update(+id, body, req.user);
  }
}
