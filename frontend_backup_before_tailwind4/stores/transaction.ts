import { defineStore } from 'pinia'

interface TransactionState {
  transactions: any[]
  currentTransaction: any | null
  loading: boolean
  error: string | null
}

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionState => ({
    transactions: [],
    currentTransaction: null,
    loading: false,
    error: null,
  }),
  actions: {
    setTransactions(transactions: any[]) {
      this.transactions = transactions
    },
    setCurrentTransaction(transaction: any | null) {
      this.currentTransaction = transaction
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    setError(error: string | null) {
      this.error = error
    },
    clearTransaction() {
      this.currentTransaction = null
      this.error = null
    },
  },
})
