## Модуль «Склад и материалы» (inventory/warehouse)

### 1. Назначение

- **Цель**: автоматизировать учёт материалов (в первую очередь филаментов для FDM‑принтеров), их движение и резервирование под заказы 3D‑печати, а также подготовить данные для бухгалтерии и аналитики.
- **Домен**: backend‑модуль `inventory` (см. `docs/architecture.md`), интеграция с `orders`, `production`, `finance`, внешними ERP/бухгалтерскими системами.

---

### 2. ER‑модель (словами)

Основные сущности и связи:

- **Material** — номенклатура материалов (PLA, PETG, TPU, PVA, смазки, сопла, расходники).
  - 1 → N к `MaterialBatch`.
- **MaterialCategory** — категории материалов.
  - 1 → N к `Material`.
- **Warehouse** — склады/зоны хранения.
  - 1 → N к `MaterialBatch`.
- **MaterialBatch** — партии/катушки материалов.
  - N → 1 к `Material`.
  - N → 1 к `Warehouse`.
  - 1 → N к `StockMovement`.
  - 1 → N к `MaterialReservationItem`.
- **StockMovement** — документ движения (приход, расход, списание, корректировка).
  - N → 1 к `MaterialBatch`.
- **MaterialReservation** — резерв под конкретный заказ/производственное задание.
  - 1 → N к `MaterialReservationItem`.
- **MaterialReservationItem** — конкретный резерв по партии (batch).
  - N → 1 к `MaterialBatch`.
  - N → 1 к `MaterialReservation`.
- **Supplier** — поставщики (минимально для связки с приходами).
  - 1 → N к `MaterialBatch`.

---

### 3. Сущности и поля

#### 3.1. `material_category`

- `id: uuid`
- `name: text` — `"Филаменты"`, `"Сопла"`, `"Смазочные материалы"`.
- `description: text | null`
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.2. `material`

- `id: uuid`
- `category_id: uuid` → `material_category.id`
- `code: text` — внутренний код/SKU.
- `name: text` — `"PLA 1.75мм"`.
- `description: text | null`
- `material_type: text` — `"PLA" | "PETG" | "TPU" | "PVA" | "NOZZLE" | ...`.
- `color_name: text | null` — `"Белый"`, `"Чёрный"`, `"Оранжевый"`.
- `color_hex: text | null` — `#ffffff`, `#020617` и т.п.
- `density_g_cm3: numeric(6,3) | null` — для филаментов.
- `spool_weight_kg: numeric(8,3) | null` — типовая масса катушки.
- `diameter_mm: numeric(4,2) | null` — например, `1.75`.
- `unit: text` — `"kg" | "pcs" | "m"` (базовая единица учёта).
- `min_reorder_level: numeric(12,3) | null`
- `max_stock_level: numeric(12,3) | null`
- `barcode: text | null`
- `is_active: boolean`
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.3. `warehouse`

- `id: uuid`
- `code: text`
- `name: text`
- `address: text | null`
- `description: text | null`
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.4. `supplier`

- `id: uuid`
- `name: text`
- `inn_or_tax_id: text | null`
- `contact_name: text | null`
- `contact_email: text | null`
- `contact_phone: text | null`
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.5. `material_batch`

- `id: uuid`
- `material_id: uuid` → `material.id`
- `warehouse_id: uuid` → `warehouse.id`
- `supplier_id: uuid | null` → `supplier.id`
- `supplier_material_code: text | null`
- `lot_number: text | null`
- `receipt_document_number: text | null`
- `receipt_date: date`
- `expiration_date: date | null`
- `quantity_initial: numeric(12,3)` — сколько пришло (в базовой единице).
- `quantity_on_hand: numeric(12,3)` — текущее кол‑во на складе.
- `quantity_reserved: numeric(12,3)` — в резервах.
- `unit_cost: numeric(12,4)` — цена за единицу (без НДС).
- `vat_rate: numeric(4,2) | null` — НДС, %.
- `currency: text` — `"RUB"`, `"USD"`, ….
- `storage_conditions: text | null`
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.6. `stock_movement`

- `id: uuid`
- `material_batch_id: uuid` → `material_batch.id`
- `type: text` — `"RECEIPT" | "ISSUE" | "ADJUSTMENT" | "WRITE_OFF"`.
- `document_number: text | null`
- `document_date: date | null`
- `quantity: numeric(12,3)` — со знаком: приход (+), расход (−).
- `unit_cost: numeric(12,4) | null`
- `reason: text | null`
- `related_order_id: uuid | null` — ссылка на заказ/production job.
- `created_by_user_id: uuid | null`
- `created_at: timestamptz`

#### 3.7. `material_reservation`

- `id: uuid`
- `related_order_id: uuid | null` — заказ клиента.
- `related_production_job_id: uuid | null` — задание производства.
- `status: text` — `"reserved" | "partially_reserved" | "released" | "failed"`.
- `reason: text | null`
- `created_by_user_id: uuid | null`
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.8. `material_reservation_item`

- `id: uuid`
- `reservation_id: uuid` → `material_reservation.id`
- `material_batch_id: uuid` → `material_batch.id`
- `material_id: uuid` → `material.id`
- `required_qty: numeric(12,3)` — потребность.
- `reserved_qty: numeric(12,3)` — фактически зарезервировано.
- `unit: text` — для явного контроля единиц.
- `status: text` — `"reserved" | "partial" | "failed" | "released"`.
- `created_at: timestamptz`
- `updated_at: timestamptz`

---

### 4. Функциональные требования

#### 4.1. Учёт поступлений

- Создание приходных партий (`material_batch`) c указанием:
  - поставщика, документа, партии (lot), цены, НДС;
  - количества в базовых единицах (`kg`, `pcs`, `m`);
  - срока годности и условий хранения.
- Автоматическая запись движения в `stock_movement` с типом `RECEIPT`.

#### 4.2. Хранение и атрибуты материалов

- Ведение каталога материалов (`material`) с привязкой к категориям и цветам.
- Хранение физических атрибутов (плотность, диаметр, масса катушки) для расчёта потребления от объёма модели (см³).
- Установка минимальных/максимальных уровней запасов для предупреждения дефицита.

#### 4.3. Формирование потребности и резервирование

- По заказу на печать:
  - определять объём модели (полученный из `printing/ModelViewer3D` и калькулятора);
  - с учётом плотности и настроек печати рассчитывать ориентир по массе/длине филамента.
- На основе расчёта формировать `material_reservation` и `material_reservation_item`:
  - выбирать партии `material_batch` с достаточным остатком;
  - уменьшать `quantity_on_hand`, увеличивать `quantity_reserved`.
- Поддерживать частичное резервирование и сценарии недостатка материала.

#### 4.4. Контроль остатков и дефицита

- Для каждого материала и склада рассчитывать:
  - `available_stock = quantity_on_hand - quantity_reserved` (агрегировано по партиям).
- Сравнивать `available_stock` с `min_reorder_level` и формировать сигналы к закупке.
- Подготавливать агрегированные срезы для дашбордов:
  - текущие остатки по материалам и цветам;
  - топ‑материалы по обороту;
  - дефицитные позиции.

#### 4.5. Интеграция с бухгалтерией

- Экспортировать движения запасов (`stock_movement`) с ключевыми полями:
  - `document_number`, `document_date`, `type`, `material_code`, `quantity`, `unit_cost`, `vat_rate`, `amount`, `currency`.
- Поддерживать обмен через API/файлы (CSV, XML, JSON) для различных систем учёта.
- Фиксировать связи с бухгалтерскими операциями (идентификаторы проводок, если есть).

#### 4.6. Безопасность и доступ

- Роли:
  - **кладовщик** — операции прихода/расхода/резервирования;
  - **планировщик производства** — формирование потребности и резервов;
  - **бухгалтер** — доступ к финансовым атрибутам и отчётам;
  - **администратор** — управление справочниками и правами.
- Логирование всех критичных операций (создание партий, движений, резервов).

---

### 5. Примеры API (черновик)

- `GET /api/inventory/materials` — список материалов с остатками и резервами.
- `POST /api/inventory/material-batches/receipt` — регистрация прихода партии.
- `POST /api/inventory/reservations` — создание резерва под заказ (на входе: заказ, объём модели, материал).
- `GET /api/inventory/stock` — агрегированные остатки по материалам.

---

### 6. Примеры отчётов

1. **Отчёт по остаткам материалов**
   - Колонки: `material_code`, `material_name`, `color_name`, `warehouse`, `on_hand`, `reserved`, `available`, `unit`, `stock_value`.

2. **Отчёт по движению материалов за период**
   - Колонки: `date`, `document_number`, `type`, `material_code`, `material_name`, `quantity`, `unit`, `unit_cost`, `amount`, `warehouse`, `related_order`.

3. **Отчёт по расходу филамента по заказам**
   - Колонки: `period_start`, `period_end`, `material_code`, `color_name`, `consumed_qty`, `wastage`, `usage_rate`, `top_customers`.

