import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from './enums/payment-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
  ) {}

  create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentsRepository.create(createPaymentDto);
    payment.status = PaymentStatus.PENDING;
    return this.paymentsRepository.save(payment);
  }

  findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find();
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByOrder(orderId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { orderId },
    });
    if (!payment) {
      throw new NotFoundException(`Payment for order ${orderId} not found`);
    }
    return payment;
  }

  async findByUser(userId: string): Promise<Payment[]> {
    const payments = await this.paymentsRepository.find({
      where: { userId },
    });
    if (!payments.length) {
      throw new NotFoundException(`No payments found for user ${userId}`);
    }
    return payments;
  }

  async confirm(id: string): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = PaymentStatus.CONFIRMED;
    return this.paymentsRepository.save(payment);
  }

  async cancel(id: string): Promise<Payment> {
    const payment = await this.findOne(id);
    payment.status = PaymentStatus.CANCELED;
    return this.paymentsRepository.save(payment);
  }
}
