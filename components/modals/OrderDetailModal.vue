<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && order"
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60" @click="emit('close')" />

        <!-- Panel -->
        <div class="relative w-full max-w-xl my-4 sm:my-6">
          <div class="rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">

            <!-- ── Header ── -->
            <div class="px-6 pt-5 pb-4 border-b border-black/10 flex items-start justify-between gap-3">
              <div>
                <p class="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Detalle del pedido</p>
                <h3 class="mt-1 text-[18px] font-bold text-[#111827]">{{ order.orderCode }}</h3>
              </div>
              <div class="flex items-center gap-2 shrink-0 pt-0.5">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-[12px] font-semibold"
                  :style="{ backgroundColor: STATUS_COLORS[order.status]?.bg, color: STATUS_COLORS[order.status]?.text }"
                >
                  {{ STATUS_LABELS[order.status] }}
                </span>
                <button
                  type="button"
                  class="grid h-8 w-8 place-items-center rounded-xl hover:bg-black/5 text-gray-400 transition"
                  aria-label="Cerrar"
                  @click="emit('close')"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Loading detail -->
            <div v-if="loadingDetail" class="py-16 flex justify-center">
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"></div>
            </div>

            <!-- ── Body ── -->
            <div v-else class="overflow-y-auto max-h-[72vh] px-6 py-5 space-y-5">

              <!-- ─ 1. Resumen ─ -->
              <div>
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Resumen</p>
                <div class="rounded-xl bg-[#F8F8F9] px-4 py-4 space-y-4">
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                      <p class="text-[11px] text-gray-400">Fecha de entrega</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">{{ formatDate(order.deliveryDate) }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] text-gray-400">Hora</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">{{ order.deliveryTime ?? '—' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] text-gray-400">Tipo</p>
                      <span
                        v-if="order.orderType"
                        class="mt-0.5 inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                        :style="typeColor(order.orderType)"
                      >{{ typeLabel(order.orderType) }}</span>
                      <p v-else class="mt-0.5 text-[13px] text-gray-400">—</p>
                    </div>
                  </div>
                  <!-- Montos -->
                  <div class="border-t border-black/10 pt-4 grid grid-cols-3 gap-x-4">
                    <div>
                      <p class="text-[11px] text-gray-400">Total</p>
                      <p class="mt-0.5 text-[18px] font-bold text-[#111827]">{{ activeData?.totalAmount ?? order.totalAmount ?? '—' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] text-gray-400">Anticipo</p>
                      <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">{{ activeData?.advancePayment ?? order.advancePayment ?? '—' }}</p>
                    </div>
                    <div>
                      <p class="text-[11px] text-gray-400">Saldo restante</p>
                      <p class="mt-0.5 text-[14px] font-semibold text-[#C9007C]">{{ activeData?.remainingBalance ?? order.remainingBalance ?? '—' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ─ 2. Dirección de entrega ─ -->
              <div v-if="activeDeliveryAddress">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Dirección de entrega</p>
                <div class="rounded-xl bg-[#F8F8F9] px-4 py-4 space-y-3">
                  <!-- Receptor -->
                  <div v-if="activeDeliveryAddress.receiverName" class="flex items-center gap-3">
                    <div class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-100">
                      <svg class="h-4 w-4 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-[13px] font-semibold text-[#111827]">{{ activeDeliveryAddress.receiverName }}</p>
                      <p v-if="activeDeliveryAddress.receiverPhone" class="text-[12px] text-gray-500">{{ activeDeliveryAddress.receiverPhone }}</p>
                    </div>
                  </div>
                  <!-- Dirección -->
                  <div v-if="buildDeliveryAddress" class="flex items-start gap-3">
                    <div class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-100">
                      <svg class="h-4 w-4 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <p class="text-[13px] text-gray-700 leading-relaxed pt-1">{{ buildDeliveryAddress }}</p>
                  </div>
                  <!-- Notas de entrega -->
                  <div v-if="activeDeliveryAddress.deliveryNotes" class="ml-11 rounded-lg bg-white px-3 py-2 ring-1 ring-black/5 text-[12px] text-gray-500 italic">
                    Nota: {{ activeDeliveryAddress.deliveryNotes }}
                  </div>
                </div>
              </div>

              <!-- ─ 3. Cliente ─ -->
              <div v-if="activeCustomer">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Cliente</p>
                <div class="rounded-xl bg-[#F8F8F9] px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E6ABFA] font-bold text-[13px] text-[#7C00C9]">
                      {{ nameInitials(activeCustomer.fullName) }}
                    </div>
                    <div>
                      <p class="text-[14px] font-semibold text-[#111827]">{{ activeCustomer.fullName }}</p>
                      <p class="text-[12px] text-gray-500">{{ activeCustomer.phone ?? '—' }}</p>
                    </div>
                  </div>
                  <div v-if="buildCustomerAddress" class="mt-3 flex items-center gap-2 text-[12px] text-gray-500">
                    <svg class="h-3.5 w-3.5 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {{ buildCustomerAddress }}
                  </div>
                </div>
              </div>

              <!-- ─ 4. Imagen de referencia ─ -->
              <div>
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Imagen de referencia</p>
                <div class="rounded-xl overflow-hidden ring-1 ring-black/10">
                  <template v-if="referenceUrls.length > 0">
                    <div :class="referenceUrls.length > 1 ? 'grid grid-cols-2 gap-0.5' : ''">
                      <img
                        v-for="(url, i) in referenceUrls"
                        :key="i"
                        :src="url"
                        alt="Referencia del pedido"
                        class="w-full object-cover bg-gray-100"
                        :class="referenceUrls.length > 1 ? 'max-h-44' : 'max-h-64'"
                      />
                    </div>
                  </template>
                  <div v-else class="flex flex-col items-center justify-center gap-3 py-12 bg-[#FAFAFA]">
                    <div class="grid h-14 w-14 place-items-center rounded-2xl bg-gray-100">
                      <svg class="h-7 w-7 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                    <p class="text-[13px] text-gray-400">Sin imagen de referencia</p>
                  </div>
                </div>
              </div>

              <!-- ─ Auditoría ─ -->
              <div
                v-if="activeCreatedBy || activeUpdatedBy"
                class="rounded-xl bg-[#FAFAFA] border border-black/5 px-4 py-3 space-y-1.5"
              >
                <div v-if="activeCreatedBy" class="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  Creado por
                  <span class="font-semibold text-gray-500">{{ activeCreatedBy.name }} {{ activeCreatedBy.lastname }}</span>
                  · {{ formatDateTime(order.createdAt) }}
                </div>
                <div
                  v-if="activeUpdatedBy && order.updatedAt !== order.createdAt"
                  class="flex items-center gap-1.5 text-[11px] text-gray-400"
                >
                  <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Actualizado por
                  <span class="font-semibold text-gray-500">{{ activeUpdatedBy.name }} {{ activeUpdatedBy.lastname }}</span>
                  · {{ formatDateTime(order.updatedAt) }}
                </div>
              </div>

            </div><!-- /body -->
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ordersService,
  STATUS_LABELS,
  STATUS_COLORS,
  TYPE_COLORS,
  TYPE_LABELS,
  type OrderItem,
  type OrderType,
} from '~/services/orders.service'

const props = defineProps<{
  open: boolean
  order: OrderItem | null
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

// ── Fetch full detail on open ────────────────────────────────────────────────
const activeData    = ref<OrderItem | null>(null)
const loadingDetail = ref(false)

watch(
  () => props.open,
  async (v) => {
    if (!v || !props.order) { activeData.value = null; return }
    loadingDetail.value = true
    try {
      activeData.value = await ordersService.getOrder(props.order.id)
    } catch {
      activeData.value = null // fall back to list data
    } finally {
      loadingDetail.value = false
    }
  }
)

// ── Escape key ───────────────────────────────────────────────────────────────
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// ── Computed from detail (fallback to list data) ────────────────────────────
const activeDeliveryAddress = computed(() => activeData.value?.deliveryAddress ?? props.order?.deliveryAddress)
const activeCustomer        = computed(() => activeData.value?.customer ?? props.order?.customer)
const activeCreatedBy       = computed(() => activeData.value?.createdBy ?? props.order?.createdBy)
const activeUpdatedBy       = computed(() => activeData.value?.updatedBy ?? props.order?.updatedBy)

const referenceUrls = computed(() => {
  const ref = activeData.value?.reference ?? props.order?.reference
  if (!ref) return []
  return Array.isArray(ref) ? ref : [ref]
})

const buildDeliveryAddress = computed(() => {
  const a = activeDeliveryAddress.value
  if (!a) return ''
  return [a.street?.trim(), a.number ? `#${a.number}` : null, a.neighborhood?.trim(), a.city?.trim()]
    .filter(Boolean).join(', ')
})

const buildCustomerAddress = computed(() => {
  const a = activeCustomer.value?.address
  if (!a) return ''
  return [a.street?.trim(), a.number ? `#${a.number}` : null, a.neighborhood?.trim(), a.city?.trim()]
    .filter(Boolean).join(', ')
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function nameInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) return ((parts[0]![0] ?? '') + (parts[1]![0] ?? '')).toUpperCase()
  return parts[0]?.slice(0, 2).toUpperCase() ?? '??'
}

function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const mon = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${day}/${mon}/${d.getUTCFullYear()}`
}

function formatDateTime(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  const date = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
  const time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  return `${date} ${time}`
}

function typeColor(t?: OrderType) {
  return t ? (TYPE_COLORS[t] ?? { bg: '#eee', text: '#333' }) : { bg: '#eee', text: '#333' }
}

function typeLabel(t?: OrderType) {
  return t ? (TYPE_LABELS[t] ?? t) : '—'
}
</script>
