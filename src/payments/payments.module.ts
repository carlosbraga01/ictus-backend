import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { StripeProvider } from './providers/stripe.provider';
import { MercadoPagoProvider } from './providers/mercadopago.provider';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    OrdersModule,
    ConfigModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    StripeProvider,
    MercadoPagoProvider,
  ],
  exports: [TypeOrmModule, PaymentService],
})
export class PaymentsModule {}
