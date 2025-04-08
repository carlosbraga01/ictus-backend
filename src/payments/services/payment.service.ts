import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { StripeProvider } from '../providers/stripe.provider';
import { MercadoPagoProvider } from '../providers/mercadopago.provider';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { OrdersService } from '../../orders/orders.service';

@Injectable()
export class PaymentService {
  private providers: { [key: string]: PaymentProvider };

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly ordersService: OrdersService,
    private readonly stripeProvider: StripeProvider,
    private readonly mercadoPagoProvider: MercadoPagoProvider,
  ) {
    this.providers = {
      stripe: stripeProvider,
      mercadopago: mercadoPagoProvider,
    };
  }

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const order = await this.ordersService.findOne(createPaymentDto.orderId);

      const provider = this.getProvider(createPaymentDto.paymentMethod);
      const metadata = {
        orderId: order.id,
        userId: createPaymentDto.userId,
        description: `Payment for Order ${order.id}`,
      };

      const paymentIntent = await provider.createPaymentIntent(
        order.totalPrice,
        'BRL',
        metadata,
      );

      const payment = this.paymentRepository.create({
        orderId: order.id,
        userId: createPaymentDto.userId,
        amount: order.totalPrice,
        status: PaymentStatus.PENDING,
        paymentMethod: createPaymentDto.paymentMethod,
        reference: createPaymentDto.reference,
        providerPaymentId: paymentIntent.id,
        clientSecret: paymentIntent.clientSecret,
      });

      return this.paymentRepository.save(payment);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create payment');
    }
  }

  async confirmPayment(paymentId: string): Promise<Payment> {
    const payment = await this.findPaymentById(paymentId);
    if (!payment.providerPaymentId) {
      throw new BadRequestException('Provider payment ID not found');
    }
    const provider = this.getProvider(payment.paymentMethod);
    await provider.confirmPayment(payment.providerPaymentId);

    payment.status = PaymentStatus.CONFIRMED;
    return this.paymentRepository.save(payment);
  }

  async refundPayment(paymentId: string): Promise<Payment> {
    const payment = await this.findPaymentById(paymentId);
    if (!payment.providerPaymentId) {
      throw new BadRequestException('Provider payment ID not found');
    }
    const provider = this.getProvider(payment.paymentMethod);
    const success = await provider.refundPayment(payment.providerPaymentId);

    if (success) {
      payment.status = PaymentStatus.REFUNDED;
      return this.paymentRepository.save(payment);
    }

    throw new BadRequestException('Refund failed');
  }

  async getPaymentStatus(
    paymentId: string,
  ): Promise<{ status: PaymentStatus }> {
    const payment = await this.findPaymentById(paymentId);
    if (!payment.providerPaymentId) {
      throw new BadRequestException('Provider payment ID not found');
    }
    const provider = this.getProvider(payment.paymentMethod);
    const status = await provider.getPaymentStatus(payment.providerPaymentId);

    const mappedStatus = this.mapProviderStatus(status);
    if (mappedStatus !== payment.status) {
      payment.status = mappedStatus;
      await this.paymentRepository.save(payment);
    }

    return { status: mappedStatus };
  }

  private async findPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return payment;
  }

  private getProvider(method: PaymentMethod): PaymentProvider {
    const providerMap = {
      [PaymentMethod.CREDIT_CARD]: 'stripe',
      [PaymentMethod.DEBIT_CARD]: 'stripe',
      [PaymentMethod.PIX]: 'mercadopago',
      [PaymentMethod.BANK_TRANSFER]: 'mercadopago',
    } as const;

    const provider = this.providers[providerMap[method]];
    if (!provider) {
      throw new BadRequestException('Invalid payment method');
    }

    return provider;
  }

  private mapProviderStatus(providerStatus: string): PaymentStatus {
    const statusMap: { [key: string]: PaymentStatus } = {
      succeeded: PaymentStatus.CONFIRMED,
      processing: PaymentStatus.PROCESSING,
      pending: PaymentStatus.PENDING,
      failed: PaymentStatus.FAILED,
      canceled: PaymentStatus.CANCELED,
      refunded: PaymentStatus.REFUNDED,
    };

    return statusMap[providerStatus] || PaymentStatus.FAILED;
  }
}
