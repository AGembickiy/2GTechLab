<template>
  <div class="space-y-6">
    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
      <div class="flex flex-wrap gap-2">
        <AppButton
          v-for="section in sections"
          :key="section.value"
          size="sm"
          :variant="activeSection === section.value ? 'solid' : 'soft'"
          :color="activeSection === section.value ? 'primary' : 'gray'"
          @click="activeSection = section.value"
        >
          {{ section.label }}
        </AppButton>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <div class="mb-4 flex items-center justify-between gap-4">
        <h2 class="text-sm font-semibold text-slate-200">
          {{ editingMaterialId ? 'Редактировать позицию склада' : 'Добавить позицию склада' }}
        </h2>
        <AppButton v-if="editingMaterialId" color="gray" variant="soft" size="sm" @click="resetForm">
          Отменить
        </AppButton>
      </div>

      <form class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4" @submit.prevent="saveMaterial">
        <select
          v-model="form.category"
          required
          class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70"
        >
          <option value="filament">Материалы (филаменты)</option>
          <option value="consumable">Расходные материалы</option>
          <option value="packaging">Упаковочные материалы</option>
        </select>
        <input v-model.trim="form.name" type="text" placeholder="Название" required class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.trim="form.material_type" type="text" placeholder="Тип (PLA, ABS, PETG...)" required class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.trim="form.manufacturer" type="text" placeholder="Производитель" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.trim="form.supplier" type="text" placeholder="Поставщик" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.trim="form.color_hex" type="text" placeholder="#FFFFFF" pattern="^#[0-9A-Fa-f]{6}$" required class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.price_per_kg" type="number" min="0" step="0.01" placeholder="Цена за кг" required class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.purchase_price" type="number" min="0" step="0.01" placeholder="Цена закупки" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.weight_g" type="number" min="0" step="0.1" placeholder="Количество на складе (г)" required class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.actual_weight_g" type="number" min="0" step="0.1" placeholder="Фактическое количество (г)" required class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.min_weight_g" type="number" min="0" step="0.1" placeholder="Мин. остаток (г)" required class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.density" type="number" min="0" step="0.01" placeholder="Плотность (г/см3)" required class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.print_temperature_c" type="number" min="0" step="1" placeholder="Температура печати (°C)" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.filament_diameter_mm" type="number" min="0" step="0.01" placeholder="Диаметр нити (мм)" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.spool_weight_g" type="number" min="0" step="0.1" placeholder="Вес катушки (г)" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model.number="form.filament_length_m" type="number" min="0" step="0.1" placeholder="Длина нити (м)" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model="form.delivery_date" type="date" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model="form.expiration_date" type="date" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model="form.previous_inventory_date" type="date" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <input v-model="form.next_inventory_date" type="date" class="rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <textarea v-model.trim="form.notes" placeholder="Примечания" rows="2" class="md:col-span-2 xl:col-span-4 rounded-lg border border-slate-800/70 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-400/70" />
        <div class="flex items-center gap-2 md:col-span-2 xl:col-span-4">
          <AppButton type="submit" :loading="isSaving" color="primary">
            {{ editingMaterialId ? 'Сохранить изменения' : 'Добавить позицию' }}
          </AppButton>
          <span v-if="formError" class="text-sm text-rose-400">{{ formError }}</span>
        </div>
      </form>
    </div>

    <div class="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <h2 class="text-sm font-semibold text-slate-200">Склад (табличный режим)</h2>
      <div v-if="pending" class="mt-2 text-sm text-slate-400">Загрузка остатков…</div>
      <div v-else-if="error" class="mt-2 text-sm text-rose-400">Не удалось загрузить склад.</div>
      <div v-else class="mt-4 overflow-x-auto">
        <table v-if="activeSection !== 'suppliers' && activeSection !== 'inventory'" class="min-w-[1800px] text-left text-sm">
          <thead class="text-slate-400">
            <tr class="border-b border-slate-800/70">
              <th class="px-3 py-2">Категория</th>
              <th class="px-3 py-2">Наименование</th>
              <th class="px-3 py-2">Тип</th>
              <th class="px-3 py-2">Производитель</th>
              <th class="px-3 py-2">Поставщик</th>
              <th class="px-3 py-2">Цвет</th>
              <th class="px-3 py-2">Кол-во (г)</th>
              <th class="px-3 py-2">Фактический остаток (г)</th>
              <th class="px-3 py-2">Мин. остаток (г)</th>
              <th class="px-3 py-2">Плотность</th>
              <th class="px-3 py-2">Темп. печати</th>
              <th class="px-3 py-2">Диаметр нити</th>
              <th class="px-3 py-2">Вес катушки</th>
              <th class="px-3 py-2">Длина нити</th>
              <th class="px-3 py-2">Цена закупки</th>
              <th class="px-3 py-2">Цена за кг</th>
              <th class="px-3 py-2">Поставка</th>
              <th class="px-3 py-2">Срок годности</th>
              <th class="px-3 py-2">Предыдущая инв.</th>
              <th class="px-3 py-2">Следующая инв.</th>
              <th class="px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="material in filteredMaterials"
              :key="material.id"
              class="border-b border-slate-900/70 text-slate-200"
            >
              <td class="px-3 py-2">{{ categoryLabelMap[material.category] }}</td>
              <td class="px-3 py-2 font-medium">{{ material.name }}</td>
              <td class="px-3 py-2">{{ material.material_type }}</td>
              <td class="px-3 py-2">{{ material.manufacturer || '—' }}</td>
              <td class="px-3 py-2">{{ material.supplier || '—' }}</td>
              <td class="px-3 py-2">
                <span class="inline-flex items-center gap-2">
                  <span class="h-3 w-3 rounded-full border border-slate-600" :style="{ backgroundColor: material.color_hex }" />
                  {{ material.color_hex }}
                </span>
              </td>
              <td class="px-3 py-2">{{ material.weight_g }}</td>
              <td class="px-3 py-2">{{ material.actual_weight_g }}</td>
              <td class="px-3 py-2">{{ material.min_weight_g }}</td>
              <td class="px-3 py-2">{{ material.density }}</td>
              <td class="px-3 py-2">{{ material.print_temperature_c ?? '—' }}</td>
              <td class="px-3 py-2">{{ material.filament_diameter_mm ?? '—' }}</td>
              <td class="px-3 py-2">{{ material.spool_weight_g ?? '—' }}</td>
              <td class="px-3 py-2">{{ material.filament_length_m ?? '—' }}</td>
              <td class="px-3 py-2">{{ material.purchase_price ?? '—' }}</td>
              <td class="px-3 py-2">{{ material.price_per_kg }}</td>
              <td class="px-3 py-2">{{ material.delivery_date ?? '—' }}</td>
              <td class="px-3 py-2">{{ material.expiration_date ?? '—' }}</td>
              <td class="px-3 py-2">{{ material.previous_inventory_date ?? '—' }}</td>
              <td class="px-3 py-2">{{ material.next_inventory_date ?? '—' }}</td>
              <td class="px-3 py-2">
                <div class="flex justify-end gap-2">
                  <AppButton size="xs" color="gray" variant="soft" @click="startEdit(material)">
                    Изменить
                  </AppButton>
                  <AppButton
                    size="xs"
                    color="red"
                    variant="soft"
                    :loading="deletingMaterialId === material.id"
                    @click="removeMaterial(material.id)"
                  >
                    Удалить
                  </AppButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table v-else-if="activeSection === 'suppliers'" class="min-w-full text-left text-sm">
          <thead class="text-slate-400">
            <tr class="border-b border-slate-800/70">
              <th class="px-3 py-2">Поставщик</th>
              <th class="px-3 py-2">Кол-во позиций</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="supplier in supplierStats" :key="supplier.name" class="border-b border-slate-900/70 text-slate-200">
              <td class="px-3 py-2">{{ supplier.name }}</td>
              <td class="px-3 py-2">{{ supplier.count }}</td>
            </tr>
          </tbody>
        </table>

        <table v-else class="min-w-full text-left text-sm">
          <thead class="text-slate-400">
            <tr class="border-b border-slate-800/70">
              <th class="px-3 py-2">Материал</th>
              <th class="px-3 py-2">Учётный остаток (г)</th>
              <th class="px-3 py-2">Фактический остаток (г)</th>
              <th class="px-3 py-2">Расхождение (г)</th>
              <th class="px-3 py-2">Дата след. инв.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="material in materials ?? []" :key="material.id" class="border-b border-slate-900/70 text-slate-200">
              <td class="px-3 py-2">{{ material.name }}</td>
              <td class="px-3 py-2">{{ material.weight_g }}</td>
              <td class="px-3 py-2">{{ material.actual_weight_g }}</td>
              <td class="px-3 py-2" :class="material.actual_weight_g - material.weight_g < 0 ? 'text-rose-300' : 'text-emerald-300'">
                {{ (material.actual_weight_g - material.weight_g).toFixed(1) }}
              </td>
              <td class="px-3 py-2">{{ material.next_inventory_date ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminMaterialDto, AdminMaterialPayload } from '~/composables/useAdminApi'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const adminApi = useAdminApi()
const { data: materials, pending, error, refresh } = await useAsyncData('admin-materials', () =>
  adminApi.listMaterials(),
)

interface WarehouseMaterialForm {
  category: 'filament' | 'consumable' | 'packaging'
  name: string
  material_type: string
  manufacturer: string
  supplier: string
  color_hex: string
  price_per_kg: number
  purchase_price: number | null
  weight_g: number
  actual_weight_g: number
  min_weight_g: number
  print_temperature_c: number | null
  filament_diameter_mm: number | null
  spool_weight_g: number | null
  filament_length_m: number | null
  delivery_date: string
  expiration_date: string
  notes: string
  previous_inventory_date: string
  next_inventory_date: string
  density: number
}

function createInitialForm(): WarehouseMaterialForm {
  return {
    category: 'filament',
    name: '',
    material_type: 'PLA',
    manufacturer: '',
    supplier: '',
    color_hex: '#FFFFFF',
    price_per_kg: 0,
    purchase_price: null,
    weight_g: 0,
    actual_weight_g: 0,
    min_weight_g: 0,
    print_temperature_c: null,
    filament_diameter_mm: null,
    spool_weight_g: null,
    filament_length_m: null,
    delivery_date: '',
    expiration_date: '',
    notes: '',
    previous_inventory_date: '',
    next_inventory_date: '',
    density: 1.25,
  }
}

const form = reactive<WarehouseMaterialForm>(createInitialForm())
const editingMaterialId = ref<number | null>(null)
const deletingMaterialId = ref<number | null>(null)
const isSaving = ref(false)
const formError = ref('')
const activeSection = ref<'filaments' | 'consumables' | 'packaging' | 'suppliers' | 'inventory'>('filaments')

const sections = [
  { value: 'filaments', label: 'Материалы (филаменты)' },
  { value: 'consumables', label: 'Расходные материалы' },
  { value: 'packaging', label: 'Упаковочные материалы' },
  { value: 'suppliers', label: 'Поставщики' },
  { value: 'inventory', label: 'Инвентаризация' },
] as const

const categoryLabelMap: Record<AdminMaterialDto['category'], string> = {
  filament: 'Филаменты',
  consumable: 'Расходники',
  packaging: 'Упаковка',
}

const sectionCategoryMap = {
  filaments: 'filament',
  consumables: 'consumable',
  packaging: 'packaging',
} as const

const filteredMaterials = computed(() => {
  const values = materials.value ?? []
  if (activeSection.value === 'suppliers' || activeSection.value === 'inventory') {
    return values
  }
  return values.filter((item) => item.category === sectionCategoryMap[activeSection.value])
})

const supplierStats = computed(() => {
  const stats = new Map<string, number>()
  for (const item of materials.value ?? []) {
    const key = item.supplier?.trim() || 'Без поставщика'
    stats.set(key, (stats.get(key) ?? 0) + 1)
  }
  return Array.from(stats.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

function resetForm() {
  Object.assign(form, createInitialForm())
  editingMaterialId.value = null
  formError.value = ''
}

function toPayload(): AdminMaterialPayload {
  return {
    name: form.name,
    category: form.category,
    material_type: form.material_type,
    manufacturer: form.manufacturer,
    supplier: form.supplier,
    color_hex: form.color_hex,
    price_per_kg: String(form.price_per_kg),
    purchase_price: form.purchase_price === null ? null : String(form.purchase_price),
    weight_g: form.weight_g,
    actual_weight_g: form.actual_weight_g,
    min_weight_g: form.min_weight_g,
    print_temperature_c: form.print_temperature_c,
    filament_diameter_mm: form.filament_diameter_mm,
    spool_weight_g: form.spool_weight_g,
    filament_length_m: form.filament_length_m,
    delivery_date: form.delivery_date || null,
    expiration_date: form.expiration_date || null,
    notes: form.notes,
    previous_inventory_date: form.previous_inventory_date || null,
    next_inventory_date: form.next_inventory_date || null,
    density: form.density,
  }
}

function startEdit(material: AdminMaterialDto) {
  editingMaterialId.value = material.id
  formError.value = ''
  form.category = material.category
  form.name = material.name
  form.material_type = material.material_type
  form.manufacturer = material.manufacturer ?? ''
  form.supplier = material.supplier ?? ''
  form.color_hex = material.color_hex
  form.price_per_kg = Number(material.price_per_kg)
  form.purchase_price = material.purchase_price === null ? null : Number(material.purchase_price)
  form.weight_g = material.weight_g
  form.actual_weight_g = material.actual_weight_g
  form.min_weight_g = material.min_weight_g
  form.print_temperature_c = material.print_temperature_c
  form.filament_diameter_mm = material.filament_diameter_mm
  form.spool_weight_g = material.spool_weight_g
  form.filament_length_m = material.filament_length_m
  form.delivery_date = material.delivery_date ?? ''
  form.expiration_date = material.expiration_date ?? ''
  form.notes = material.notes ?? ''
  form.previous_inventory_date = material.previous_inventory_date ?? ''
  form.next_inventory_date = material.next_inventory_date ?? ''
  form.density = material.density
}

async function saveMaterial() {
  isSaving.value = true
  formError.value = ''
  try {
    const payload = toPayload()
    if (editingMaterialId.value) {
      await adminApi.updateMaterial(editingMaterialId.value, payload)
    } else {
      await adminApi.createMaterial(payload)
    }
    await refresh()
    resetForm()
  } catch {
    formError.value = 'Не удалось сохранить материал.'
  } finally {
    isSaving.value = false
  }
}

async function removeMaterial(id: number) {
  deletingMaterialId.value = id
  formError.value = ''
  try {
    await adminApi.deleteMaterial(id)
    await refresh()
    if (editingMaterialId.value === id) {
      resetForm()
    }
  } catch {
    formError.value = 'Не удалось удалить материал.'
  } finally {
    deletingMaterialId.value = null
  }
}
</script>
