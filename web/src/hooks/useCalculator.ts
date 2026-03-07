"use client";

import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import type { CalculatorState } from "@/store/slices/calculatorSlice";
import { setCalculatorParams } from "@/store/slices/calculatorSlice";
import { CALCULATOR_RATES } from "@/lib/calculatorConfig";
import { calculatePricing } from "@/lib/calculatorPricing";

export const useCalculator = () => {
  const dispatch = useDispatch();
  const state = useSelector((s: RootState) => s.calculator);

  const availableMaterials = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(CALCULATOR_RATES.materials).filter(
          ([, material]) =>
            material.isActive && material.inStockGrams > 0,
        ),
      ),
    [],
  );

  const pricing = useMemo(
    () => calculatePricing(state),
    [state],
  );

  const setParams = (patch: Partial<CalculatorState>) => {
    dispatch(setCalculatorParams(patch));
  };

  return {
    state,
    pricing,
    setParams,
    materials: availableMaterials,
  };
};

