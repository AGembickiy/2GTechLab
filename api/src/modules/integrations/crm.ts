export type CrmSystemName = "generic_crm";

export interface CrmCustomerPayload {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

export interface CrmOrderPayload {
  id: string;
  customerId: string;
  totalAmount: number;
  currency: string;
  status: string;
}

export interface CrmAdapter {
  upsertCustomer(payload: CrmCustomerPayload): Promise<void>;
  upsertOrder(payload: CrmOrderPayload): Promise<void>;
}

export class GenericCrmAdapter implements CrmAdapter {
  async upsertCustomer(_payload: CrmCustomerPayload): Promise<void> {
    // Экспорт/синхронизация клиента во внешнюю CRM
  }

  async upsertOrder(_payload: CrmOrderPayload): Promise<void> {
    // Экспорт/синхронизация заказа
  }
}

