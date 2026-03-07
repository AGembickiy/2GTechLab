## Модуль «Оборудование и обслуживание» (equipment)

### 1. Назначение

- **Цель**: вести учёт 3D‑принтеров и сопутствующего оборудования, регламентировать и фиксировать обслуживание/ремонт, снижать простои и связывать состояние оборудования с производственными заданиями.
- **Домен**: backend‑модуль `equipment` (см. `docs/architecture.md`), интеграция с модулями `production`, `inventory`, `finance`.

---

### 2. ER‑модель (словами)

Основные сущности и связи:

- **Equipment** — единица оборудования (принтер Bambu Lab A1, сушилка филамента, вытяжка).
  - 1 → N к `EquipmentMaintenance` (оборудование имеет много записей обслуживания).
  - 1 → N к `EquipmentRepair`.
  - 1 → N к `EquipmentStatusHistory`.
  - 1 → N к `ProductionJob` (связь через модуль `production`).
- **EquipmentModel** — справочник моделей (Bambu Lab A1, A1 mini, и др.).
  - 1 → N к `Equipment`.
- **EquipmentLocation** — локации (цех, зона, стол).
  - 1 → N к `Equipment`.
- **EquipmentMaintenance** — записи планового/внепланового обслуживания.
  - N → 1 к `Equipment`.
- **EquipmentRepair** — записи ремонтов и замен узлов.
  - N → 1 к `Equipment`.
- **EquipmentStatusHistory** — история состояний (в работе, простаивает, на обслуживании, сломано).
  - N → 1 к `Equipment`.
- **EquipmentDocument** — связанные файлы (паспорт, инструкция, гарантия).
  - N → 1 к `Equipment`.
- **EquipmentKpiSnapshot** — агрегированные показатели (MTBF, MTTR и др.)
  - N → 1 к `Equipment`.

---

### 3. Сущности и поля

#### 3.1. `equipment_model`

- `id: uuid`
- `brand: text` — например, `"Bambu Lab"`.
- `model: text` — `"A1"`.
- `technology: text` — `"FDM/FFF"`.
- `build_volume_x_mm: integer` — `256`.
- `build_volume_y_mm: integer` — `256`.
- `build_volume_z_mm: integer` — `256`.
- `nozzle_diameter_mm: numeric` — по умолчанию `0.4`.
- `max_nozzle_temp_c: integer` — `300`.
- `max_bed_temp_c: integer` — `100`.
- `supported_materials: text[]` — `["PLA","PETG","TPU","PVA"]`.
- `color_channels: integer` — `4` (AMS).
- `has_heated_bed: boolean`
- `has_camera: boolean`
- `has_filament_sensor: boolean`
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.2. `equipment_location`

- `id: uuid`
- `name: text` — `"Цех №1"`, `"Стол A1-01"`.
- `description: text | null`
- `parent_location_id: uuid | null` — иерархия.
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.3. `equipment`

- `id: uuid`
- `inventory_code: text` — внутренний инвентарный номер.
- `serial_number: text`
- `equipment_model_id: uuid` → `equipment_model.id`
- `location_id: uuid | null` → `equipment_location.id`
- `status: text` — `"active" | "maintenance" | "failed" | "retired"`.
- `commissioned_at: date` — дата ввода в эксплуатацию.
- `warranty_expires_at: date | null`
- `firmware_version: text | null`
- `notes: text | null`
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.4. `equipment_status_history`

- `id: uuid`
- `equipment_id: uuid` → `equipment.id`
- `status: text` — `"active" | "idle" | "maintenance" | "failed"`.
- `reason: text | null`
- `changed_by_user_id: uuid | null` — ссылка на `users`.
- `changed_at: timestamptz`

#### 3.5. `equipment_maintenance`

- `id: uuid`
- `equipment_id: uuid` → `equipment.id`
- `type: text` — `"preventive" | "inspection" | "calibration"`.
- `title: text` — `"Ежедневная проверка Bambu Lab A1"`.
- `description: text`
- `planned_at: timestamptz | null`
- `performed_at: timestamptz | null`
- `performed_by_user_id: uuid | null`
- `duration_minutes: integer | null`
- `result: text` — краткий итог.
- `next_due_at: timestamptz | null`
- `status: text` — `"planned" | "in_progress" | "done" | "cancelled"`.
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.6. `equipment_repair`

- `id: uuid`
- `equipment_id: uuid` → `equipment.id`
- `title: text` — `"Замена сопла 0.4 мм"`.
- `description: text`
- `fault_description: text` — симптоматика.
- `root_cause: text | null` — причина (по итогам анализа).
- `reported_at: timestamptz`
- `reported_by_user_id: uuid | null`
- `started_at: timestamptz | null`
- `completed_at: timestamptz | null`
- `repaired_by_user_id: uuid | null`
- `downtime_minutes: integer | null` — простой оборудования.
- `parts_cost: numeric(12,2) | null`
- `labor_cost: numeric(12,2) | null`
- `total_cost: numeric(12,2) | null`
- `status: text` — `"reported" | "in_progress" | "waiting_parts" | "completed" | "cancelled"`.
- `created_at: timestamptz`
- `updated_at: timestamptz`

#### 3.7. `equipment_document`

- `id: uuid`
- `equipment_id: uuid` → `equipment.id`
- `type: text` — `"manual" | "warranty" | "calibration_certificate" | "photo"`.
- `file_id: uuid` — ссылка на сущность файлов в хранилище (S3/MinIO).
- `name: text`
- `uploaded_at: timestamptz`
- `uploaded_by_user_id: uuid | null`

#### 3.8. `equipment_kpi_snapshot`

- `id: uuid`
- `equipment_id: uuid` → `equipment.id`
- `period_start: date`
- `period_end: date`
- `mtbf_hours: numeric(10,2) | null` — Mean Time Between Failures.
- `mttr_hours: numeric(10,2) | null` — Mean Time To Repair.
- `planned_maintenance_share: numeric(5,2) | null` — % плановых работ.
- `printed_jobs_count: integer`
- `printed_hours: numeric(10,2)`
- `failed_jobs_count: integer`
- `created_at: timestamptz`

---

### 4. Требования к функционалу модуля

#### 4.1. Учёт оборудования

- Добавление/редактирование/архивация единиц оборудования.
- Привязка к модели (`Bambu Lab A1`) и локации.
- Ведение паспорта принтера: серийник, дата ввода, гарантия, область печати 256×256×256 мм, совместимые материалы и др.

#### 4.2. Плановое обслуживание

- Шаблоны регламентов для FDM‑принтеров (например, Bambu Lab A1):
  - Ежедневно: очистка стола, визуальный осмотр, проверка датчиков.
  - Еженедельно: проверка натяжения ремней, тестовая печать кубика.
  - Ежемесячно: смазка направляющих, калибровка осей.
  - Ежеквартально: проверка электроники, обновление прошивки.
- Планирование задач обслуживания с напоминаниями (по дате/пробегу часов печати).
- Фиксация факта выполнения (акт обслуживания) и перенос следующей даты.

#### 4.3. Ремонт и инциденты

- Регистрация неисправностей с привязкой к принтеру и заказам (через `ProductionJob` / `Order`).
- Ведение жизненного цикла ремонта: от регистрации до завершения.
- Хранение информации о причинах, затратах и простое оборудования.

#### 4.4. KPI и аналитика

- Расчёт и хранение MTBF/MTTR по каждому принтеру.
- Аналитика: сколько заказов/часов печати принтер отработал между поломками.
- Дашборды загруженности и надежности парка принтеров.

---

### 5. Примеры API (черновик)

- `GET /api/equipment` — список оборудования с фильтрами по статусу и локации.
- `GET /api/equipment/:id` — детальная карточка принтера (паспорт, последние обслуживания/ремонты, KPI).
- `POST /api/equipment/:id/maintenance` — создание записи обслуживания.
- `POST /api/equipment/:id/repairs` — регистрация неисправности/ремонта.

