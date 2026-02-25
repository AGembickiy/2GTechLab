export type ShippingProviderName = "dhl" | "fedex";

export interface ShippingRateRequest {
  destinationCountry: string;
  destinationPostalCode: string;
  weightKg: number;
}

export interface ShippingRate {
  provider: ShippingProviderName;
  serviceName: string;
  amount: number;
  currency: string;
  estimatedDays: number;
}

export interface TrackingInfo {
  provider: ShippingProviderName;
  trackingNumber: string;
  status: string;
  url: string;
}

export interface ShippingProviderAdapter {
  getRates(request: ShippingRateRequest): Promise<ShippingRate[]>;
  track(trackingNumber: string): Promise<TrackingInfo>;
}

export class DhlAdapter implements ShippingProviderAdapter {
  async getRates(request: ShippingRateRequest): Promise<ShippingRate[]> {
    // Заглушка для DHL API
    return [
      {
        provider: "dhl",
        serviceName: "DHL Express",
        amount: 1000,
        currency: "RUB",
        estimatedDays: 3,
      },
    ];
  }

  async track(trackingNumber: string): Promise<TrackingInfo> {
    return {
      provider: "dhl",
      trackingNumber,
      status: "IN_TRANSIT",
      url: `https://www.dhl.com/track?tracking-id=${trackingNumber}`,
    };
  }
}

export class FedexAdapter implements ShippingProviderAdapter {
  async getRates(request: ShippingRateRequest): Promise<ShippingRate[]> {
    return [
      {
        provider: "fedex",
        serviceName: "FedEx International",
        amount: 1200,
        currency: "RUB",
        estimatedDays: 4,
      },
    ];
  }

  async track(trackingNumber: string): Promise<TrackingInfo> {
    return {
      provider: "fedex",
      trackingNumber,
      status: "IN_TRANSIT",
      url: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    };
  }
}

