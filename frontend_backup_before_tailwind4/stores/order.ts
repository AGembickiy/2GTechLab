import { defineStore } from 'pinia';

interface OrderState {
  orders: any[];
  currentOrder: any | null;
  loading: boolean;
  error: string | null;
}

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
  }),
  actions: {
    setOrders(orders: any[]) {
      this.orders = orders;
    },
    setCurrentOrder(order: any | null) {
      this.currentOrder = order;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    setError(error: string | null) {
      this.error = error;
    },
    clearOrder() {
      this.currentOrder = null;
      this.error = null;
    },
  },
});
