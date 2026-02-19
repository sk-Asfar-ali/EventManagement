import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterEventDto } from './dto/register-event.dto';
import { CancelEventDto } from './dto/cancel-event.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //  Get All Events For Dashboard
  @Get(':userId/events')
  async getEvents(@Param('userId') userId: number) {
    return this.usersService.getEventsForUser(userId);
  }

  //  Register
  @Post(':userId/events/register')
  async register(
    @Param('userId') userId: number,
    @Body() dto: RegisterEventDto,
  ) {
    return this.usersService.registerToEvent(userId, dto.eventId);
  }

  //  Cancel
  @Patch(':userId/events/cancel')
  async cancel(
    @Param('userId') userId: number,
    @Body() dto: CancelEventDto,
  ) {
    return this.usersService.cancelRegistration(userId, dto.eventId);
  }

  //  My Events
  @Get(':userId/events/my')
  async getMyEvents(@Param('userId') userId: number) {
    return this.usersService.getMyEvents(userId);
  }
}
