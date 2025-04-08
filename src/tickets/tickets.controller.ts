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
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { Ticket } from './entities/ticket.entity';

@ApiTags('tickets')
@ApiBearerAuth()
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: Ticket,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
    return this.ticketsService.create(createTicketDto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiResponse({
    status: 200,
    description: 'List of all tickets',
    type: [Ticket],
  })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('user')
  @ApiOperation({ summary: 'Get all tickets for a user' })
  @ApiResponse({
    status: 200,
    description: 'List of tickets for the buyer',
    type: [Ticket],
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findUserTickets(@Request() req) {
    return this.ticketsService.findByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket found',
    type: Ticket,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
    type: Ticket,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Request() req,
  ) {
    return this.ticketsService.update(id, updateTicketDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ORGANIZER)
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires ORGANIZER role',
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.ticketsService.remove(id, req.user.id);
  }
}
