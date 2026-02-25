export type PaymentProviderName = "stripe" | "paypal";

export interface PaymentInitParams {
  orderId: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentSession {
  id: string;
  provider: PaymentProviderName;
  checkoutUrl: string;
}

export interface PaymentWebhookPayload {
  provider: PaymentProviderName;
  rawBody: string;
  signature: string | null;
}

export interface PaymentProviderAdapter {
  initPayment(params: PaymentInitParams): Promise<PaymentSession>;
  handleWebhook(payload: PaymentWebhookPayload): Promise<void>;
}

export class StripeAdapter implements PaymentProviderAdapter {
  async initPayment(params: PaymentInitParams): Promise<PaymentSession> {
    // Здесь будет реальная интеграция с Stripe SDK / REST API
    return {
      id: `stub_stripe_${params.orderId}`,
      provider: "stripe",
      checkoutUrl: "https://checkout.stripe.com/test-stub",
    };
  }

  async handleWebhook(_payload: PaymentWebhookPayload): Promise<void> {
    // Обработка событий оплаты, обновление статуса заказов и платежей
  }
}

export class PaypalAdapter implements PaymentProviderAdapter {
  async initPayment(params: PaymentInitParams): Promise<PaymentSession> {
    return {
      id: `stub_paypal_${params.orderId}`,
      provider: "paypal",
      checkoutUrl: "https://www.paypal.com/checkoutnow?token=stub",
    };
  }

  async handleWebhook(_payload: PaymentWebhookPayload): Promise<void> {
    // Обработка webhook событий PayPal
  }
}

