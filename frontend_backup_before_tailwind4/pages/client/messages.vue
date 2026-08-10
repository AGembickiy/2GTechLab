<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-lg font-bold text-slate-100">Сообщения</h2>
      <div v-if="pending" class="mt-4 text-sm text-slate-400">Загрузка…</div>
      <div v-else-if="error" class="mt-4 text-sm text-rose-400">Не удалось загрузить сообщения.</div>
      <div v-else-if="messages.length === 0" class="mt-4 text-sm text-slate-400">
        У вас пока нет сообщений.
      </div>
      <div v-else class="mt-4 space-y-3">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="
            message.is_read
              ? 'rounded-lg border border-slate-800/40 bg-slate-900/20 p-4'
              : 'rounded-lg border border-slate-800/60 bg-slate-950/30 p-4'
          "
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-400">
                От: {{ message.sender_name }}
              </span>
              <span v-if="!message.is_read" class="h-2 w-2 rounded-full bg-cyan-400"></span>
            </div>
            <p class="text-sm text-slate-400">
              {{ formatDate(message.created_at) }}
            </p>
          </div>
          <p class="mt-2 font-semibold text-slate-200">{{ message.subject }}</p>
          <p class="mt-1 text-sm text-slate-300 line-clamp-2">{{ message.body }}</p>
          <div class="mt-3">
            <AppButton size="sm" variant="primary" @click="viewMessage(message.id)">
              Прочитать
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessageService } from '@/services/messageService'

definePageMeta({
  layout: 'client',
  middleware: 'auth-check',
})

const route = useRoute()
const authStore = useAuthStore()

const messageService = new MessageService()

const { data: messages, pending, error } = await useAsyncData('user-messages', () =>
  messageService.listMessages(),
)

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function viewMessage(id: number) {
  messageService.markAsRead(id)
  navigateTo(`/messages/${id}`)
}
</script>
