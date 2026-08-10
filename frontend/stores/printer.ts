import { defineStore } from 'pinia'

interface PrinterState {
  printers: any[]
  currentPrinter: any | null
  loading: boolean
  error: string | null
}

export const usePrinterStore = defineStore('printer', {
  state: (): PrinterState => ({
    printers: [],
    currentPrinter: null,
    loading: false,
    error: null,
  }),
  actions: {
    setPrinters(printers: any[]) {
      this.printers = printers
    },
    setCurrentPrinter(printer: any | null) {
      this.currentPrinter = printer
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    setError(error: string | null) {
      this.error = error
    },
    clearPrinter() {
      this.currentPrinter = null
      this.error = null
    },
  },
})
