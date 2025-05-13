import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { Event } from './entities/event.entity';

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: Event,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events' })
  @ApiResponse({
    status: 200,
    description: 'List of all events',
    type: [Event],
  })
  findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get event by slug (public)' })
  @ApiResponse({ status: 200, description: 'Event found', type: Event })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findBySlug(@Param('slug') slug: string): Promise<Event> {
    return this.eventsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event found',
    type: Event,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Get('organizer/:organizerId')
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Get all events by organizer ID' })
  @ApiResponse({
    status: 200,
    description: 'List of events by organizer',
    type: [Event],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  findByOrganizer(@Param('organizerId') organizerId: string): Promise<Event[]> {
    return this.eventsService.findByOrganizer(organizerId);
  }

  @Patch(':id')
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: Event,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Request() req,
  ): Promise<Event> {
    return this.eventsService.update(id, updateEventDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.eventsService.remove(id, req.user.id);
  }
}
