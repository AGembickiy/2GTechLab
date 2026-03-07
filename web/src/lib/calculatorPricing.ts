import type { CalculatorState } from "@/store/slices/calculatorSlice";
import {
  CALCULATOR_RATES,
  HOURS_PER_GRAM_BASE,
  INFILL_TIME_FACTOR,
  LAYER_HEIGHT_TIME_FACTORS,
} from "@/lib/calculatorConfig";

export interface PricingResult {
  materialCost: number;
  machineCost: number;
  /** Коммунальные расходы (по времени работы оборудования). */
  utilitiesCost: number;
  /** Операционные издержки как надбавка к себестоимости. */
  operatingOverheadCost: number;
  /** Наценка (базовая или срочная). */
  markupAmount: number;
  machineTimeHours: number;
  postProcessingCost: number;
  totalPrice: number;
  estimatedDurationHours: number;
}

/**
 * Рассчитывает стоимость 3D‑печати по параметрам калькулятора.
 * Если вес не задан или 0 — возвращает нулевые значения.
 */
export function calculatePricing(state: CalculatorState): PricingResult {
  const {
    weightGrams,
    materialCode,
    quantity,
    postProcessing,
    printTimeHours,
    infillPercent,
    layerHeightMm,
  } = state;
  const materials = CALCULATOR_RATES.materials;
  const material = materials[materialCode as keyof typeof materials] ?? materials.pla;

  if (!weightGrams || weightGrams <= 0) {
    return {
      materialCost: 0,
      utilitiesCost: 0,
      operatingOverheadCost: 0,
      markupAmount: 0,
      machineCost: 0,
      machineTimeHours: 0,
      postProcessingCost: 0,
      totalPrice: 0,
      estimatedDurationHours: 0,
    };
  }

  const materialCost = weightGrams * material.pricePerGram * quantity;

  // Коэффициент по заполнению: при меньшем заполнении печать быстрее, при большем — медленнее.
  const clampedInfill = Math.min(
    INFILL_TIME_FACTOR.maxPercent,
    Math.max(INFILL_TIME_FACTOR.minPercent, infillPercent),
  );
  let infillTimeFactor: number;
  if (clampedInfill <= INFILL_TIME_FACTOR.basePercent) {
    // Линейная интерполяция от minFactor (на minPercent) до 1 (на basePercent).
    const span = INFILL_TIME_FACTOR.basePercent - INFILL_TIME_FACTOR.minPercent || 1;
    const t = (clampedInfill - INFILL_TIME_FACTOR.minPercent) / span;
    infillTimeFactor = INFILL_TIME_FACTOR.minFactor + t * (1 - INFILL_TIME_FACTOR.minFactor);
  } else {
    // Линейная интерполяция от 1 (на basePercent) до maxFactor (на maxPercent).
    const span = INFILL_TIME_FACTOR.maxPercent - INFILL_TIME_FACTOR.basePercent || 1;
    const t = (clampedInfill - INFILL_TIME_FACTOR.basePercent) / span;
    infillTimeFactor = 1 + t * (INFILL_TIME_FACTOR.maxFactor - 1);
  }

  // Коэффициент по высоте слоя: более тонкий слой — дольше, толстый — быстрее.
  const layerFactor =
    LAYER_HEIGHT_TIME_FACTORS[layerHeightMm] ??
    LAYER_HEIGHT_TIME_FACTORS[0.2] ??
    1;

  const hoursPerGramEffective = HOURS_PER_GRAM_BASE * infillTimeFactor * layerFactor;

  const estimatedHoursPerItem =
    printTimeHours > 0 ? printTimeHours : weightGrams * hoursPerGramEffective;
  const machineTimeHours = estimatedHoursPerItem * quantity;
  const machineCost = machineTimeHours * CALCULATOR_RATES.machineRatePerHour;
  const utilitiesCost = machineTimeHours * CALCULATOR_RATES.utilitiesPerHour;

  const baseCost = materialCost + machineCost + utilitiesCost;
  const operatingOverheadCost = baseCost * CALCULATOR_RATES.operatingOverheadRate;

  const costWithOverheads = baseCost + operatingOverheadCost;

  const markupRate =
    state.urgency === "rush"
      ? CALCULATOR_RATES.markups.rush
      : CALCULATOR_RATES.markups.base;
  const markupAmount = costWithOverheads * markupRate;

  const postProcessingCost = postProcessing ? quantity * CALCULATOR_RATES.postProcessingPerItem : 0;
  const totalPrice = costWithOverheads + markupAmount + postProcessingCost;

  return {
    materialCost,
    machineCost,
    utilitiesCost,
    operatingOverheadCost,
    markupAmount,
    machineTimeHours,
    postProcessingCost,
    totalPrice,
    estimatedDurationHours: machineTimeHours,
  };
}
