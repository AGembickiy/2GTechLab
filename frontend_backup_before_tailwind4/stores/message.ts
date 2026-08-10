import { defineStore } from 'pinia'

interface MessageState {
  messages: any[]
  currentMessage: any | null
  unreadCount: number
  loading: boolean
  error: string | null
}

export const useMessageStore = defineStore('message', {
  state: (): MessageState => ({
    messages: [],
    currentMessage: null,
    unreadCount: 0,
    loading: false,
    error: null,
  }),
  actions: {
    setMessages(messages: any[]) {
      this.messages = messages
    },
    setCurrentMessage(message: any | null) {
      this.currentMessage = message
    },
    setUnreadCount(count: number) {
      this.unreadCount = count
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    setError(error: string | null) {
      this.error = error
    },
    clearMessage() {
      this.currentMessage = null
      this.error = null
    },
  },
})
