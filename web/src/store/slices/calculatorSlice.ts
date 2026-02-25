import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CalculatorState {
  modelFileId?: string;
  materialCode?: string;
  infillPercent: number;
  layerHeightMm: number;
  quantity: number;
  postProcessing: boolean;
}

const initialState: CalculatorState = {
  infillPercent: 20,
  layerHeightMm: 0.2,
  quantity: 1,
  postProcessing: false,
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
      state.materialCode = undefined;
    },
  },
});

export const { setCalculatorParams, resetCalculator } = calculatorSlice.actions;
export default calculatorSlice.reducer;

