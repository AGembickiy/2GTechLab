import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_MATERIAL_CODE } from "@/lib/calculatorConfig";

export interface CalculatorState {
  modelFileId?: string;
  materialCode: string;
  infillPercent: number;
  layerHeightMm: number;
  quantity: number;
  postProcessing: boolean;
  /** Срочность заказа: влияет на наценку. */
  urgency: "standard" | "rush";
  /** Вес модели в граммах (для расчёта без загрузки файла). */
  weightGrams: number;
  /** Время печати одного изделия в часах; 0 — оценка по весу. */
  printTimeHours: number;
}

const initialState: CalculatorState = {
  materialCode: DEFAULT_MATERIAL_CODE,
  infillPercent: 20,
  layerHeightMm: 0.2,
  quantity: 1,
  postProcessing: false,
  urgency: "standard",
  weightGrams: 0,
  printTimeHours: 0,
};

const calculatorSlice = createSlice({
  name: "calculator",
  initialState,
  reducers: {
    setCalculatorParams(
      state,
      action: PayloadAction<Partial<CalculatorState>>,
    ) {
      Object.assign(state, action.payload);
    },
    resetCalculator(state) {
      Object.assign(state, initialState);
      state.modelFileId = undefined;
    },
  },
});

export const { setCalculatorParams, resetCalculator } = calculatorSlice.actions;
export default calculatorSlice.reducer;

