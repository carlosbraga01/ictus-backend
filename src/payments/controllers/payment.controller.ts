import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Headers,
  RawBodyRequest,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { Request } from 'express';
import { StripeProvider } from '../providers/stripe.provider';
import type Stripe from 'stripe';

interface MercadoPagoWebhookEvent {
  type: string;
  data: {
    id: string;
  };
}

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly stripeProvider: StripeProvider,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get payment status' })
  @ApiResponse({ status: 200, description: 'Returns payment status' })
  getStatus(@Param('id') id: string) {
    return this.paymentService.getPaymentStatus(id);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm a payment' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  confirm(@Param('id') id: string) {
    return this.paymentService.confirmPayment(id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded successfully' })
  refund(@Param('id') id: string) {
    return this.paymentService.refundPayment(id);
  }

  @Post('webhook/stripe')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      const rawBody = request.rawBody;
      if (!rawBody) {
        throw new BadRequestException('Missing request body');
      }

      const event = this.stripeProvider.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.stripeProvider.paymentConfig.stripe.webhookSecret,
      );

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          if (paymentIntent.metadata?.paymentId) {
            await this.paymentService.confirmPayment(
              paymentIntent.metadata.paymentId,
            );
          }
          break;
        }
        case 'payment_intent.payment_failed':
          // Handle failed payment
          break;
      }

      return { received: true };
    } catch (err) {
      const error = err as Error;
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
  }

  @Post('webhook/mercadopago')
  @ApiOperation({ summary: 'Handle MercadoPago webhook events' })
  async handleMercadoPagoWebhook(@Body() body: MercadoPagoWebhookEvent) {
    try {
      if (body.type === 'payment') {
        const paymentId = body.data.id;
        await this.paymentService.confirmPayment(paymentId);
      }

      return { received: true };
    } catch (err) {
      const error = err as Error;
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }
  }
}
