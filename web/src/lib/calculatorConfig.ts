export interface CalculatorMaterialDefinition {
  /** Отображаемое имя варианта материала для клиента. */
  label: string;
  /** Технология печати (для справки в админке). */
  technologyTitle: string;
  brand: string;
  type: string;
  color: string;
  diameterMm: number;
  density: number;
  /** Цена материала за грамм. */
  pricePerGram: number;
  /** Текущий остаток на складе в граммах. */
  inStockGrams: number;
  /** Флаг активности: только активные варианты попадают в калькулятор. */
  isActive: boolean;
}

export const CALCULATOR_MATERIALS: Record<string, CalculatorMaterialDefinition> = {
  pla: {
    label: "PLA, 1.75 мм (белый)",
    technologyTitle: "FDM/FFF",
    brand: "Generic",
    type: "PLA-пластик",
    color: "Белый",
    diameterMm: 1.75,
    density: 1.24,
    pricePerGram: 1.2,
    inStockGrams: 5000,
    isActive: true,
  },
  petg: {
    label: "PETG, 1.75 мм (чёрный)",
    technologyTitle: "FDM/FFF",
    brand: "Generic",
    type: "PETG-пластик",
    color: "Чёрный",
    diameterMm: 1.75,
    density: 1.27,
    pricePerGram: 1.5,
    inStockGrams: 3000,
    isActive: true,
  },
  abs: {
    label: "ABS, 1.75 мм (серый)",
    technologyTitle: "FDM/FFF",
    brand: "Generic",
    type: "ABS-пластик",
    color: "Серый",
    diameterMm: 1.75,
    density: 1.04,
    pricePerGram: 1.4,
    inStockGrams: 2000,
    isActive: true,
  },
  tpu: {
    label: "TPU, 1.75 мм (чёрный, гибкий)",
    technologyTitle: "FDM/FFF",
    brand: "Generic",
    type: "TPU (эластичный пластик)",
    color: "Чёрный",
    diameterMm: 1.75,
    density: 1.21,
    pricePerGram: 2,
    inStockGrams: 1500,
    isActive: true,
  },
} as const;

export const CALCULATOR_RATES = {
  materials: CALCULATOR_MATERIALS,
  machineRatePerHour: 350,
  postProcessingPerItem: 300,
  /** Коммунальные расходы на час работы оборудования. */
  utilitiesPerHour: 80,
  /**
   * Операционные издержки как доля от суммы (материал + работа оборудования + коммунальные).
   * Например, 0.15 = 15%.
   */
  operatingOverheadRate: 0.15,
  /**
   * Базовая и срочная наценка как доля от себестоимости (материал + машина + коммунальные + операционные).
   * Например, 0.3 = 30%.
   */
  markups: {
    base: 0.3,
    rush: 0.6,
  },
} as const;

/** Базовая оценка часов печати на 1 г материала при типичных настройках. */
export const HOURS_PER_GRAM_BASE = 0.04;

/** Доступные пресеты высоты слоя для UI. */
export const LAYER_HEIGHT_PRESETS = [0.1, 0.15, 0.2, 0.25, 0.3] as const;

/** Диапазон для ползунка заполнения. */
export const INFILL_PERCENT_RANGE = {
  min: 5,
  max: 100,
  step: 5,
} as const;

/**
 * Мультипликаторы времени печати в зависимости от высоты слоя.
 * 1 — базовое время, >1 — дольше, <1 — быстрее.
 */
export const LAYER_HEIGHT_TIME_FACTORS: Record<number, number> = {
  0.1: 1.4,
  0.15: 1.2,
  0.2: 1,
  0.25: 0.85,
  0.3: 0.7,
};

/**
 * Параметры влияния заполнения на время печати.
 * При меньшем заполнении печать быстрее, при большем — медленнее.
 */
export const INFILL_TIME_FACTOR = {
  /** Процент заполнения, вокруг которого считаем "базовый" профиль. */
  basePercent: 20,
  /** Минимальный и максимальный проценты заполнения из UI. */
  minPercent: INFILL_PERCENT_RANGE.min,
  maxPercent: INFILL_PERCENT_RANGE.max,
  /** Мультипликаторы для min/max заполнения относительно базового. */
  minFactor: 0.7,
  maxFactor: 1.4,
} as const;

export type MaterialCode = keyof typeof CALCULATOR_RATES.materials;

export const DEFAULT_MATERIAL_CODE: MaterialCode = "pla";

