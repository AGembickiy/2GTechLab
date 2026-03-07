import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: string;
  /**
   * Тип позиции: товар из каталога или 3D‑печать по параметрам калькулятора.
   */
  type: "product" | "print";
  /**
   * Количество единиц (для печати — количество изделий).
   */
  quantity: number;
  /**
   * Связь с товаром каталога (для product‑позиций).
   */
  productId?: string;
  /**
   * Связь с загруженным файлом модели (для print‑позиций).
   */
  modelFileId?: string;
  /**
   * Снимок параметров калькулятора и расчёта цены на момент добавления в корзину.
   * Для product‑позиций может быть не задан.
   */
  calculatorSnapshot?: {
    state: import("./calculatorSlice").CalculatorState;
    pricing: import("@/lib/calculatorPricing").PricingResult;
    createdAt: string;
  };
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      state.items.push(action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

