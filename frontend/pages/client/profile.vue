<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-lg font-bold text-slate-100">Мой профиль</h2>

      <div class="mt-6 space-y-4">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-xs font-semibold text-slate-200">Логин</label>
            <p class="rounded-lg border border-slate-800/60 bg-slate-950/30 px-3 py-2 text-slate-300">
              {{ user.username }}
            </p>
          </div>
          <div>
            <label class="mb-2 block text-xs font-semibold text-slate-200">Email</label>
            <p class="rounded-lg border border-slate-800/60 bg-slate-950/30 px-3 py-2 text-slate-300">
              {{ user.email || '-' }}
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-xs font-semibold text-slate-200">Телефон</label>
            <p class="rounded-lg border border-slate-800/60 bg-slate-950/30 px-3 py-2 text-slate-300">
              {{ user.profile?.phone || '-' }}
            </p>
          </div>
          <div>
            <label class="mb-2 block text-xs font-semibold text-slate-200">Роль</label>
            <span
              :class="
                roleColor[user.profile?.role || 'client']
              "
              class="rounded-full px-3 py-1 text-xs font-semibold"
            >
              {{ roleLabels[user.profile?.role || 'client'] }}
            </span>
          </div>
        </div>

        <div>
          <label class="mb-2 block text-xs font-semibold text-slate-200">Адрес</label>
          <p class="rounded-lg border border-slate-800/60 bg-slate-950/30 px-3 py-2 text-slate-300">
            {{ user.profile?.address || '-' }}
          </p>
        </div>

        <UButton color="primary" @click="editProfile">
          Редактировать профиль
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ROLES, ROLE_LABELS } from '@/constants/roles'

definePageMeta({
  layout: 'client',
  middleware: 'auth-check',
})

const roleLabels = ROLE_LABELS
const roleColor: Record<string, string> = {
  [ROLES.CLIENT]: 'bg-blue-500/20 text-blue-300',
  [ROLES.PARTNER]: 'bg-purple-500/20 text-purple-300',
  [ROLES.MANAGER]: 'bg-green-500/20 text-green-300',
  [ROLES.ADMIN]: 'bg-red-500/20 text-red-300',
}

const authStore = useAuthStore()
const user = computed(() => authStore.user)

function editProfile() {
  navigateTo('/profile')
}
</script>
