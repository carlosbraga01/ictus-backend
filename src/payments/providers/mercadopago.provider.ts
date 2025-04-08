import { Injectable } from '@nestjs/common';
import { PaymentProvider, PaymentIntent } from '../interfaces/payment-provider.interface';
import { paymentConfig } from '../config/payment.config';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class MercadoPagoProvider implements PaymentProvider {
  private mercadopago: any;

  constructor() {
    const client = new MercadoPagoConfig({ accessToken: paymentConfig.mercadoPago.accessToken });
    this.mercadopago = new Preference(client);
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<PaymentIntent> {
    const preference = {
      items: [
        {
          title: metadata?.description || 'Payment',
          unit_price: amount,
          quantity: 1,
        },
      ],
      back_urls: {
        success: metadata?.successUrl || process.env.FRONTEND_URL + '/payment/success',
        failure: metadata?.failureUrl || process.env.FRONTEND_URL + '/payment/failure',
        pending: metadata?.pendingUrl || process.env.FRONTEND_URL + '/payment/pending',
      },
      auto_return: 'approved',
      external_reference: metadata?.orderId,
      notification_url: process.env.BACKEND_URL + '/payments/webhook/mercadopago',
    };

    const response = await this.mercadopago.create({ body: preference });

    return {
      id: response.id,
      amount: amount,
      currency: currency,
      status: 'pending',
      clientSecret: response.init_point,
    };
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const payment = await this.mercadopago.get({ paymentId: paymentIntentId });
    
    return {
      id: payment.id,
      amount: payment.transaction_amount,
      currency: payment.currency_id,
      status: this.mapStatus(payment.status),
    };
  }

  async refundPayment(paymentIntentId: string): Promise<boolean> {
    try {
      await this.mercadopago.refund({ paymentId: paymentIntentId });
      return true;
    } catch (error) {
      console.error('MercadoPago refund error:', error);
      return false;
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<string> {
    const payment = await this.mercadopago.get({ paymentId: paymentIntentId });
    return this.mapStatus(payment.status);
  }

  private mapStatus(mpStatus: string): string {
    const statusMap = {
      approved: 'succeeded',
      pending: 'processing',
      in_process: 'processing',
      rejected: 'failed',
      cancelled: 'canceled',
      refunded: 'refunded',
    };

    return statusMap[mpStatus] || mpStatus;
  }
}
