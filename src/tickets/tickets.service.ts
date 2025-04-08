import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
  ): Promise<Ticket> {
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      userId,
    });
    return this.ticketRepository.save(ticket);
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({
      relations: ['event', 'user', 'buyer'],
    });
  }

  async findByUser(userId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { userId },
      relations: ['event', 'buyer'],
    });
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['event', 'user', 'buyer'],
    });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async findByEvent(eventId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { eventId },
      relations: ['event', 'user', 'buyer'],
    });
  }

  async findByBuyer(buyerId: string): Promise<Ticket[]> {
    return this.ticketRepository.find({
      where: { buyerId },
      relations: ['event', 'user', 'buyer'],
    });
  }

  async update(
    id: string,
    updateTicketDto: UpdateTicketDto,
    userId: string,
  ): Promise<Ticket> {
    const ticket = await this.findOne(id);
    if (ticket.userId !== userId) {
      throw new ForbiddenException('You can only update your own tickets');
    }
    Object.assign(ticket, updateTicketDto);
    if (
      ticket.status === TicketStatus.SOLD &&
      ticket.buyerId &&
      !ticket.qrCode
    ) {
      ticket.qrCode = await this.generateQRCode(ticket.id);
    }
    return this.ticketRepository.save(ticket);
  }

  async remove(id: string, userId: string): Promise<void> {
    const ticket = await this.findOne(id);
    if (ticket.userId !== userId) {
      throw new ForbiddenException('You can only delete your own tickets');
    }
    this.ticketRepository.delete(id);
  }

  private generateQRCode(ticketId: string): string {
    return `data:image/png;base64,${ticketId}`;
  }
}
