import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface OrderSummary {
  id: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  currency: string;
}

interface OrdersState {
  items: OrderSummary[];
}

const initialState: OrdersState = {
  items: [],
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<OrderSummary[]>) {
      state.items = action.payload;
    },
  },
});

export const { setOrders } = ordersSlice.actions;
export default ordersSlice.reducer;

