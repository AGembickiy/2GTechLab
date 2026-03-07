import { describe, it, expect } from "vitest";
import type { CalculatorState } from "@/store/slices/calculatorSlice";
import { calculatePricing } from "./calculatorPricing";
import { CALCULATOR_RATES, HOURS_PER_GRAM_BASE } from "./calculatorConfig";

const baseState: CalculatorState = {
  materialCode: "pla",
  infillPercent: 20,
  layerHeightMm: 0.2,
  quantity: 1,
  postProcessing: false,
  urgency: "standard",
  weightGrams: 50,
  printTimeHours: 0,
};

describe("calculatePricing", () => {
  it("returns zeros when weight is 0 or negative", () => {
    const zero = calculatePricing({ ...baseState, weightGrams: 0 });
    const negative = calculatePricing({ ...baseState, weightGrams: -10 });

    for (const result of [zero, negative]) {
      expect(result.materialCost).toBe(0);
      expect(result.machineCost).toBe(0);
      expect(result.utilitiesCost).toBe(0);
      expect(result.operatingOverheadCost).toBe(0);
      expect(result.markupAmount).toBe(0);
      expect(result.postProcessingCost).toBe(0);
      expect(result.totalPrice).toBe(0);
      expect(result.estimatedDurationHours).toBe(0);
    }
  });

  it("uses material price per gram correctly for different materials", () => {
    const weightGrams = 100;
    const pla = calculatePricing({ ...baseState, materialCode: "pla", weightGrams });
    const petg = calculatePricing({ ...baseState, materialCode: "petg", weightGrams });

    const plaPricePerGram = CALCULATOR_RATES.materials.pla.pricePerGram;
    const petgPricePerGram = CALCULATOR_RATES.materials.petg.pricePerGram;

    expect(pla.materialCost).toBeCloseTo(weightGrams * plaPricePerGram);
    expect(petg.materialCost).toBeCloseTo(weightGrams * petgPricePerGram);
    expect(petg.materialCost).toBeGreaterThan(pla.materialCost);
  });

  it("scales price with quantity > 1", () => {
    const one = calculatePricing({ ...baseState, quantity: 1 });
    const three = calculatePricing({ ...baseState, quantity: 3 });

    // Материал и время/стоимость оборудования/коммуналки должны расти примерно пропорционально quantity.
    expect(three.materialCost).toBeCloseTo(one.materialCost * 3);
    expect(three.machineTimeHours).toBeCloseTo(one.machineTimeHours * 3);
    expect(three.machineCost).toBeCloseTo(one.machineCost * 3);
    expect(three.utilitiesCost).toBeCloseTo(one.utilitiesCost * 3);

    // Итоговая цена тоже должна быть больше.
    expect(three.totalPrice).toBeGreaterThan(one.totalPrice);
  });

  it("uses explicit printTimeHours when provided", () => {
    const auto = calculatePricing({
      ...baseState,
      weightGrams: 80,
      printTimeHours: 0,
    });
    const manual = calculatePricing({
      ...baseState,
      weightGrams: 80,
      printTimeHours: 5,
    });

    // Автооценка по весу должна отличаться от ручного значения.
    const expectedAutoHoursPerItem = 80 * HOURS_PER_GRAM_BASE;
    expect(auto.machineTimeHours).toBeCloseTo(expectedAutoHoursPerItem * baseState.quantity, 3);
    expect(manual.machineTimeHours).toBeCloseTo(5 * baseState.quantity, 3);
  });

  it("adds postProcessing cost per item when enabled", () => {
    const without = calculatePricing({
      ...baseState,
      postProcessing: false,
      quantity: 2,
    });
    const withPost = calculatePricing({
      ...baseState,
      postProcessing: true,
      quantity: 2,
    });

    const expectedPost = 2 * CALCULATOR_RATES.postProcessingPerItem;

    expect(withPost.postProcessingCost).toBe(expectedPost);
    expect(withPost.totalPrice).toBeCloseTo(without.totalPrice + expectedPost, 1);
  });

  it("increases total price and time for rush urgency", () => {
    const standard = calculatePricing({
      ...baseState,
      urgency: "standard",
    });
    const rush = calculatePricing({
      ...baseState,
      urgency: "rush",
    });

    expect(rush.markupAmount).toBeGreaterThan(standard.markupAmount);
    expect(rush.totalPrice).toBeGreaterThan(standard.totalPrice);
  });

  it("reacts to infill and layer height (more dense & thinner layer => longer and more expensive)", () => {
    const lightFast = calculatePricing({
      ...baseState,
      infillPercent: 10,
      layerHeightMm: 0.3,
    });
    const denseSlow = calculatePricing({
      ...baseState,
      infillPercent: 60,
      layerHeightMm: 0.1,
    });

    expect(denseSlow.machineTimeHours).toBeGreaterThan(lightFast.machineTimeHours);
    expect(denseSlow.totalPrice).toBeGreaterThan(lightFast.totalPrice);
  });
});

