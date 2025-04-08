import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create(createOrderDto);
    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(id: string): Promise<Order> {
    if (!id) {
      throw new NotFoundException('Order ID is required');
    }

    const order = await this.orderRepository.findOne({
      where: { id },
      select: ['id', 'totalPrice', 'userId', 'eventId'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({ where: { userId } });
  }

  async findByEventId(eventId: string): Promise<Order[]> {
    if (!eventId) {
      throw new NotFoundException('Event ID is required');
    }

    return this.orderRepository.find({
      where: { eventId },
      select: ['id', 'totalPrice', 'userId', 'eventId'],
    });
  }

  async update(id: string, data: Partial<Order>): Promise<Order> {
    await this.findOne(id);
    await this.orderRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }
}
