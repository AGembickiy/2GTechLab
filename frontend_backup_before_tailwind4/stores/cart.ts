import { defineStore } from 'pinia';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const useCartStore = defineStore('cart', {
  state: (): CartItem[] => [],
  getters: {
    getTotal: (state) => state.reduce((sum, item) => sum + item.price * item.quantity, 0),
    getCount: (state) => state.reduce((count, item) => count + item.quantity, 0),
  },
  actions: {
    addItem(item: CartItem) {
      const existingItem = this.find((i) => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        this.push(item);
      }
    },
    removeItem(id: number) {
      const index = this.findIndex((item) => item.id === id);
      if (index > -1) {
        this.splice(index, 1);
      }
    },
    clearCart() {
      this.splice(0, this.length);
    },
  },
});
