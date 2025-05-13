import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    // Verifica se o slug já existe
    const existing = await this.eventRepository.findOne({ where: { slug: createEventDto.slug } });
    if (existing) {
      throw new Error('Slug já está em uso. Escolha outro.');
    }
    const event = this.eventRepository.create({
      ...createEventDto,
      organizerId: userId,
    });
    return this.eventRepository.save(event);
  }

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { slug }, relations: ['organizer'] });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['organizer'],
    });
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { organizerId },
      relations: ['organizer'],
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ): Promise<Event> {
    const event = await this.findOne(id);
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }
    await this.eventRepository.update(id, updateEventDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.findOne(id);
    if (event.organizerId !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }
    await this.eventRepository.delete(id);
  }
}
