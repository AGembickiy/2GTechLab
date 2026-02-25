## Интеграции

Интеграционный слой реализован через адаптеры во внутреннем модуле `api/src/modules/integrations`.

### 1. Платёжные системы

Файл: `api/src/modules/integrations/payments.ts`

- Адаптеры:
  - `StripeAdapter`
  - `PaypalAdapter`
- Интерфейс `PaymentProviderAdapter` описывает:
  - `initPayment` — создание платёжной сессии для заказа;
  - `handleWebhook` — обработка webhook‑уведомлений и обновление статусов платежей/заказов.

### 2. Логистика (службы доставки)

Файл: `api/src/modules/integrations/shipping.ts`

- Адаптеры:
  - `DhlAdapter`
  - `FedexAdapter`
- Интерфейс `ShippingProviderAdapter`:
  - `getRates` — расчёт тарифов по адресу и весу отправления;
  - `track` — получение информации по трек‑номеру.

### 3. CRM / ERP

Файл: `api/src/modules/integrations/crm.ts`

- Адаптер `GenericCrmAdapter`, реализующий интерфейс `CrmAdapter`:
  - `upsertCustomer` — создание/обновление клиента.
  - `upsertOrder` — создание/обновление заказа.

Конкретная CRM (например, AmoCRM, Bitrix24 или другая система) может быть реализована отдельным классом, имплементирующим тот же интерфейс.

### 4. Маркетплейсы

Файл: `api/src/modules/integrations/marketplaces.ts`

- Адаптер `GenericMarketplaceAdapter`, реализующий интерфейс `MarketplaceAdapter`:
  - `syncProducts` — выгрузка каталога товаров.
  - `importOrders` — импорт заказов с внешней площадки.

Данный слой абстрагирует внешний API, позволяя менять поставщиков и подключать новые площадки без изменения базовой доменной логики.

