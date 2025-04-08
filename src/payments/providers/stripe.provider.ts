import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PaymentProvider,
  PaymentIntent,
} from '../interfaces/payment-provider.interface';

type PaymentMetadata = {
  [key: string]: string;
} & {
  orderId: string;
  userId: string;
  description: string;
};

@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly stripe: Stripe;
  readonly paymentConfig: {
    stripe: {
      secretKey: string;
      publicKey: string;
      webhookSecret: string;
    };
  };

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    const publicKey = this.configService.get<string>('STRIPE_PUBLIC_KEY');
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.paymentConfig = {
      stripe: {
        secretKey,
        publicKey: publicKey || '',
        webhookSecret: webhookSecret || '',
      },
    };

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-03-31.basil',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: PaymentMetadata,
  ): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: metadata as Stripe.MetadataParam,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const paymentIntent = await this.stripe.paymentIntents.confirm(
      paymentIntentId,
    );

    return {
      id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    };
  }

  async refundPayment(paymentIntentId: string): Promise<boolean> {
    try {
      await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
      return true;
    } catch (error) {
      console.error('Stripe refund error:', error);
      return false;
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<string> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      paymentIntentId,
    );
    return paymentIntent.status;
  }
}
