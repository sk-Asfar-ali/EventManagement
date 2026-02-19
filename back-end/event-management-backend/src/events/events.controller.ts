import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/users/users.entity';
import { Roles } from 'src/auth/roles.decorator';


@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventService: EventsService) {}


  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZER)
  @Post()
  create(@Body() body, @Request() req) {
    return this.eventService.create(body, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.eventService.findAll(req.user);
  }
 @Get(':eventId')
  findById(@Param("eventId")  eventId:number) {
    return this.eventService.findById(eventId);
  }
  @Delete(':eventId')
  deleteById(@Param("eventId")  eventId:number) {
    return this.eventService.deleteById(eventId);
  }

// @Get('/organizer/:id')
// getEventsByOrganizer(
//   @Param('id', ParseIntPipe) id: number,
// ) {
//   return this.eventService.findEventsByOrganizer(id);
// }

  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() body,
    @Request() req,
  ) {
    return this.eventService.update(+id, body, req.user);
  }
}
