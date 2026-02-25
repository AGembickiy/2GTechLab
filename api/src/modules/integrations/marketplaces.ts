export type MarketplaceName = "generic_marketplace";

export interface MarketplaceProductPayload {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  stock: number;
}

export interface MarketplaceOrderPayload {
  id: string;
  externalId?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  totalAmount: number;
  currency: string;
}

export interface MarketplaceAdapter {
  syncProducts(products: MarketplaceProductPayload[]): Promise<void>;
  importOrders(): Promise<MarketplaceOrderPayload[]>;
}

export class GenericMarketplaceAdapter implements MarketplaceAdapter {
  async syncProducts(_products: MarketplaceProductPayload[]): Promise<void> {
    // Выгрузка каталога на маркетплейс
  }

  async importOrders(): Promise<MarketplaceOrderPayload[]> {
    // Загрузка заказов с маркетплейса
    return [];
  }
}

