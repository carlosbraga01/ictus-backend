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
import { Event } from '../events/entities/event.entity';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    userId: string,
  ): Promise<Ticket[] | Ticket> {
    const quantidade = createTicketDto.quantidade ?? 1;
    // Busca o evento e valida capacidade
    const event = await this.ticketRepository.manager.findOne(Event, {
      where: {
        id: createTicketDto.eventId,
      },
    });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
    const ticketsExistentes = await this.ticketRepository.count({
      where: {
        eventId: createTicketDto.eventId,
      },
    });
    if (ticketsExistentes + quantidade > event.capacity) {
      throw new ForbiddenException(
        `Não é possível criar mais tickets do que a capacidade do evento (${event.capacity})`,
      );
    }
    // Cria múltiplos tickets
    const tickets: Ticket[] = [];
    for (let i = 0; i < quantidade; i++) {
      const ticket = this.ticketRepository.create({
        ...createTicketDto,
        userId,
      });
      tickets.push(ticket);
    }
    return this.ticketRepository.save(tickets);
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
