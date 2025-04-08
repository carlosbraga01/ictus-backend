export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentProvider {
  createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string): Promise<PaymentIntent>;
  refundPayment(paymentIntentId: string): Promise<boolean>;
  getPaymentStatus(paymentIntentId: string): Promise<string>;
}
