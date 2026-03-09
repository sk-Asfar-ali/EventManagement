import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterEventDto } from './dto/register-event.dto';
import { CancelEventDto } from './dto/cancel-event.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
 @Get('events')
  async getEvents(@Request() req) {
    return this.usersService.getEventsForUser(req.user.id);
  }

  @Post('events/register')
  async register(@Request() req, @Body() dto: RegisterEventDto) {
    return this.usersService.registerToEvent(req.user.id, dto.eventId);
  }

  @Patch('events/cancel')
  async cancel(@Request() req, @Body() dto: CancelEventDto) {
    return this.usersService.cancelRegistration(req.user.id, dto.eventId);
  }

  @Get('events/my')
  async getMyEvents(@Request() req) {
    return this.usersService.getMyEvents(req.user.id);
  }
}
