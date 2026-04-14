<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Detalle de pedido · Magnolias' })

import {
  ordersService,
  STATUS_LABELS,
  STATUS_COLORS,
  TYPE_LABELS,
  TYPE_COLORS,
  DELIVERY_ROUND_LABELS,
  type OrderDetail,
  type OrderType,
  type OrderStatus,
} from '~/services/orders.service'

const route = useRoute()
const id = route.params.id as string

// ── Only bakers should access this page ─────────────────────────────────────
const { user } = useAuthUser()
if (user.value?.role !== 'BAKER') {
  await navigateTo('/admin/pedidos', { replace: true })
}

// ── Load detail ──────────────────────────────────────────────────────────────
const order = ref<OrderDetail | null>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    order.value = await ordersService.getOrder(id)
  } catch (e: any) {
    error.value = e?.message || 'No se pudo cargar el pedido.'
  } finally {
    loading.value = false
  }
})

// ── Status advance ────────────────────────────────────────────────────────────
const advancing = ref(false)
const advanceError = ref('')
const confirmOpen = ref(false)

const canAdvance = computed(() =>
  order.value?.status === 'CREATED' || order.value?.status === 'IN PROCESS'
)
const advanceLabel = computed(() => {
  if (order.value?.status === 'CREATED') return 'Iniciar producción'
  if (order.value?.status === 'IN PROCESS') return 'Marcar como listo'
  return ''
})
const advanceColor = computed(() => {
  if (order.value?.status === 'CREATED') return 'amber'
  if (order.value?.status === 'IN PROCESS') return 'violet'
  return 'gray'
})
const advanceNextLabel = computed(() => {
  if (order.value?.status === 'CREATED') return 'En producción'
  if (order.value?.status === 'IN PROCESS') return 'Listo'
  return ''
})

function requestAdvance() {
  if (!order.value || !canAdvance.value) return
  advanceError.value = ''
  confirmOpen.value = true
}

async function advance() {
  if (!order.value || advancing.value) return
  confirmOpen.value = false
  advancing.value = true
  advanceError.value = ''
  try {
    if (order.value.status === 'CREATED') {
      await ordersService.markInProcess(order.value.id)
      order.value.status = 'IN PROCESS'
    } else if (order.value.status === 'IN PROCESS') {
      await ordersService.markDone(order.value.id)
      order.value.status = 'DONE'
    }
  } catch (e: any) {
    advanceError.value = e?.message || 'No se pudo actualizar el estado.'
  } finally {
    advancing.value = false
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`
}

function typeColor(t?: OrderType) {
  return t ? (TYPE_COLORS[t] ?? { bg: '#eee', text: '#333' }) : { bg: '#eee', text: '#333' }
}
function typeLabel(t?: OrderType) {
  return t ? (TYPE_LABELS[t] ?? t) : '—'
}
function roundLabel(r?: string | null) {
  return r ? (DELIVERY_ROUND_LABELS[r] ?? r) : '—'
}
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-4 py-6 lg:px-6 lg:py-8 font-sans pb-28">

    <!-- Volver -->
    <button
      type="button"
      class="mb-5 flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-[#111827] transition"
      @click="navigateTo('/admin/pedidos')"
    >
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Volver al tablero
    </button>

    <!-- Loading -->
    <div v-if="loading" class="py-20 flex justify-center">
      <div class="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="rounded-2xl bg-red-50 px-5 py-4 text-[13px] text-red-700 ring-1 ring-red-200">
      {{ error }}
    </div>

    <!-- Contenido -->
    <template v-else-if="order">

      <!-- ── Header ── -->
      <div class="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 px-6 py-5 mb-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Pedido</p>
            <h1 class="mt-0.5 text-[24px] font-bold text-[#111827] tracking-tight">{{ order.orderCode }}</h1>
          </div>
          <!-- Estado badge grande -->
          <span
            class="shrink-0 mt-1 inline-flex rounded-xl px-3.5 py-1.5 text-[13px] font-bold"
            :style="{ backgroundColor: STATUS_COLORS[order.status as OrderStatus]?.bg, color: STATUS_COLORS[order.status as OrderStatus]?.text }"
          >{{ STATUS_LABELS[order.status as OrderStatus] }}</span>
        </div>
        <div class="mt-3 flex items-center gap-2 flex-wrap">
          <span
            class="inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ring-black/5"
            :style="{ ...typeColor(order.orderType) }"
          >{{ typeLabel(order.orderType) }}</span>
          <span v-if="order.isCustomerPickup" class="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-200/60">
            Recoge en tienda
          </span>
          <span v-if="order.branch" class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-[12px] text-gray-600">
            <svg class="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            {{ order.branch.name }}
          </span>
        </div>
      </div>

      <!-- ── Información de entrega ── -->
      <div class="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 overflow-hidden mb-4">
        <div class="px-5 py-3 border-b border-black/[0.06] flex items-center gap-2">
          <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <p class="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Entrega</p>
        </div>
        <div class="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <div>
            <p class="text-[11px] text-gray-400">Fecha</p>
            <p class="mt-0.5 text-[15px] font-bold text-[#111827]">{{ formatDate(order.deliveryDate) }}</p>
          </div>
          <div v-if="order.deliveryTime">
            <p class="text-[11px] text-gray-400">Hora</p>
            <p class="mt-0.5 text-[15px] font-bold text-[#111827]">{{ order.deliveryTime }}</p>
          </div>
          <div v-if="order.readyTime">
            <p class="text-[11px] text-gray-400">Listo a las</p>
            <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">{{ order.readyTime }}</p>
          </div>
          <div v-if="order.deliveryRound">
            <p class="text-[11px] text-gray-400">Ronda</p>
            <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">{{ roundLabel(order.deliveryRound) }}</p>
          </div>
          <div v-if="order.eventTime">
            <p class="text-[11px] text-gray-400">Hora del evento</p>
            <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">{{ order.eventTime }}</p>
          </div>
          <div v-if="order.setupTime">
            <p class="text-[11px] text-gray-400">Hora de montaje</p>
            <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">{{ order.setupTime }}</p>
          </div>
          <div v-if="order.branchDepartureTime">
            <p class="text-[11px] text-gray-400">Salida de sucursal</p>
            <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">{{ order.branchDepartureTime }}</p>
          </div>
          <div v-if="order.guestCount">
            <p class="text-[11px] text-gray-400">Invitados</p>
            <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">{{ order.guestCount }}</p>
          </div>
        </div>
      </div>

      <!-- ── Cliente ── -->
      <div v-if="order.customer" class="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 overflow-hidden mb-4">
        <div class="px-5 py-3 border-b border-black/[0.06] flex items-center gap-2">
          <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <p class="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Cliente</p>
        </div>
        <div class="px-5 py-4 flex items-center gap-3.5">
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E6ABFA] font-bold text-[14px] text-[#7C00C9]">
            {{ order.customer.fullName.slice(0, 2).toUpperCase() }}
          </div>
          <div>
            <p class="text-[15px] font-bold text-[#111827]">{{ order.customer.fullName }}</p>
            <p v-if="order.customer.phone" class="text-[13px] text-gray-500">{{ order.customer.phone }}</p>
            <p v-if="order.customer.notes" class="mt-1 text-[12px] text-gray-400 italic">{{ order.customer.notes }}</p>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- ── PRODUCTOS ── -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div v-if="order.details && order.details.length > 0" class="mb-4 space-y-3">
        <!-- Encabezado de sección -->
        <div class="flex items-center gap-2 px-1">
          <svg class="h-4 w-4 text-[#C9007C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <h2 class="text-[14px] font-bold text-[#111827]">Productos</h2>
          <span class="rounded-full bg-[#F5E6FA] px-2 py-0.5 text-[11px] font-bold text-[#7C00C9]">{{ order.details.length }}</span>
        </div>

        <!-- Un card por producto -->
        <div
          v-for="(detail, i) in order.details"
          :key="detail.id"
          class="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 overflow-hidden"
        >
          <!-- Imagen de referencia fullwidth -->
          <div v-if="detail.referenceImageUrl" class="relative">
            <img
              :src="detail.referenceImageUrl"
              alt="Imagen de referencia"
              class="w-full max-h-72 object-cover bg-gray-100"
            />
            <span class="absolute bottom-2 right-2 rounded-lg bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              Referencia
            </span>
          </div>

          <!-- Nombre y cantidad -->
          <div class="px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-black/[0.06]">
            <div class="min-w-0">
              <p class="text-[18px] font-bold text-[#111827] leading-tight">{{ detail.product?.name ?? `Producto ${i + 1}` }}</p>
              <p v-if="detail.product?.description" class="mt-0.5 text-[12px] text-gray-400">{{ detail.product.description }}</p>
            </div>
            <span class="shrink-0 rounded-xl bg-[#F5E6FA] px-3.5 py-1.5 text-[14px] font-bold text-[#7C00C9]">× {{ detail.quantity }}</span>
          </div>

          <!-- Atributos en grid de pills -->
          <div class="px-5 py-4 space-y-3">
            <div class="flex flex-wrap gap-2">
              <span v-if="detail.productSize || detail.customSize" class="inline-flex flex-col items-start rounded-xl bg-gray-50 ring-1 ring-black/[0.07] px-3.5 py-2.5">
                <span class="text-[9px] font-bold uppercase tracking-widest text-gray-400">Tamaño</span>
                <span class="mt-0.5 text-[13px] font-bold text-[#111827]">{{ detail.productSize ?? detail.customSize }}</span>
              </span>
              <span v-if="detail.flavor" class="inline-flex flex-col items-start rounded-xl bg-orange-50 ring-1 ring-orange-200/60 px-3.5 py-2.5">
                <span class="text-[9px] font-bold uppercase tracking-widest text-orange-400">Sabor</span>
                <span class="mt-0.5 text-[13px] font-bold text-orange-800">{{ detail.flavor.name }}</span>
              </span>
              <span v-if="detail.filling" class="inline-flex flex-col items-start rounded-xl bg-yellow-50 ring-1 ring-yellow-200/60 px-3.5 py-2.5">
                <span class="text-[9px] font-bold uppercase tracking-widest text-yellow-500">Relleno</span>
                <span class="mt-0.5 text-[13px] font-bold text-yellow-800">{{ detail.filling.name }}</span>
              </span>
              <span v-if="detail.frosting" class="inline-flex flex-col items-start rounded-xl bg-sky-50 ring-1 ring-sky-200/60 px-3.5 py-2.5">
                <span class="text-[9px] font-bold uppercase tracking-widest text-sky-400">Betún</span>
                <span class="mt-0.5 text-[13px] font-bold text-sky-800">{{ detail.frosting.name }}</span>
              </span>
              <span v-if="detail.breadType" class="inline-flex flex-col items-start rounded-xl bg-amber-50 ring-1 ring-amber-200/60 px-3.5 py-2.5">
                <span class="text-[9px] font-bold uppercase tracking-widest text-amber-500">Tipo de pan</span>
                <span class="mt-0.5 text-[13px] font-bold text-amber-800">{{ detail.breadType.name }}</span>
              </span>
              <span v-if="detail.color" class="inline-flex flex-col items-start rounded-xl bg-purple-50 ring-1 ring-purple-200/60 px-3.5 py-2.5">
                <span class="text-[9px] font-bold uppercase tracking-widest text-purple-400">Color</span>
                <span class="mt-0.5 text-[13px] font-bold text-purple-800">{{ detail.color.name }}</span>
              </span>
              <span v-if="detail.style" class="inline-flex flex-col items-start rounded-xl bg-rose-50 ring-1 ring-rose-200/60 px-3.5 py-2.5">
                <span class="text-[9px] font-bold uppercase tracking-widest text-rose-400">Estilo</span>
                <span class="mt-0.5 text-[13px] font-bold text-rose-800">{{ detail.style.name }}</span>
              </span>
            </div>

            <!-- Texto en pastel -->
            <div v-if="detail.hasWriting" class="rounded-xl bg-amber-50 ring-2 ring-amber-300/50 px-4 py-3.5 space-y-2">
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span class="text-[11px] font-bold uppercase tracking-widest text-amber-600">Texto en pastel</span>
              </div>
              <p v-if="detail.writingText" class="text-[16px] font-bold text-[#111827] italic">"{{ detail.writingText }}"</p>
              <div class="flex flex-wrap gap-3 text-[12px] text-amber-700">
                <span v-if="detail.writingLocation"><span class="font-semibold">Ubicación:</span> {{ detail.writingLocation }}</span>
                <span v-if="detail.pipingLocation"><span class="font-semibold">Piping:</span> {{ detail.pipingLocation }}</span>
              </div>
            </div>

            <!-- Notas de decoración y producto -->
            <div v-if="detail.decorationNotes || detail.notes" class="rounded-xl bg-gray-50 ring-1 ring-black/[0.07] px-4 py-3.5 space-y-1.5">
              <div class="flex items-center gap-2 mb-1">
                <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400">Instrucciones</span>
              </div>
              <p v-if="detail.decorationNotes" class="text-[13px] text-[#111827] leading-relaxed">
                <span class="text-gray-400 font-medium">Decoración — </span>{{ detail.decorationNotes }}
              </p>
              <p v-if="detail.notes" class="text-[13px] text-[#111827] leading-relaxed">
                <span class="text-gray-400 font-medium">Nota — </span>{{ detail.notes }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- ── FLORES ── -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div v-if="order.orderFlowers && order.orderFlowers.length > 0" class="mb-4">
        <div class="flex items-center gap-2 px-1 mb-3">
          <svg class="h-4 w-4 text-[#C9007C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <h2 class="text-[14px] font-bold text-[#111827]">Flores</h2>
          <span class="rounded-full bg-[#F5E6FA] px-2 py-0.5 text-[11px] font-bold text-[#7C00C9]">{{ order.orderFlowers.length }}</span>
        </div>
        <div class="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 overflow-hidden divide-y divide-black/[0.06]">
          <div
            v-for="(f, i) in order.orderFlowers"
            :key="i"
            class="px-5 py-4 flex items-center gap-4"
          >
            <!-- Color swatch grande -->
            <span
              class="inline-block h-9 w-9 rounded-full shrink-0 ring-2 ring-black/10 shadow-sm"
              :style="{ background: f.color?.value ?? '#e5e7eb' }"
            />
            <div class="flex-1 min-w-0">
              <p class="text-[15px] font-bold text-[#111827] truncate">{{ f.flower?.name ?? '—' }}</p>
              <p v-if="f.color" class="text-[12px] text-gray-400">{{ f.color.name }}</p>
              <p v-if="f.notes" class="mt-1 text-[12px] text-gray-400 italic">{{ f.notes }}</p>
            </div>
            <span class="shrink-0 rounded-xl bg-[#F5E6FA] px-3 py-1.5 text-[15px] font-bold text-[#7C00C9]">× {{ f.quantity }}</span>
          </div>
        </div>
      </div>

      <!-- ── Responsable del montaje ── -->
      <div v-if="order.setupPersonName" class="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 px-5 py-4 mb-4">
        <p class="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">Responsable del montaje</p>
        <p class="text-[14px] font-semibold text-[#111827]">{{ order.setupPersonName }}</p>
      </div>

    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- ── BARRA DE ACCIÓN STICKY ── -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-all duration-300"
      enter-from-class="translate-y-4 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
    >
      <div v-if="order && canAdvance" class="fixed bottom-0 inset-x-0 z-40 px-4 py-4 bg-white/80 backdrop-blur-md border-t border-black/[0.07] flex items-center gap-3 max-w-2xl mx-auto">
        <div class="flex-1">
          <p class="text-[11px] text-gray-400 leading-none mb-0.5">Estado actual</p>
          <span
            class="inline-flex rounded-full px-2.5 py-0.5 text-[12px] font-bold"
            :style="{ backgroundColor: STATUS_COLORS[order.status as OrderStatus]?.bg, color: STATUS_COLORS[order.status as OrderStatus]?.text }"
          >{{ STATUS_LABELS[order.status as OrderStatus] }}</span>
        </div>
        <button
          type="button"
          :disabled="advancing"
          :class="[
            'flex-1 rounded-2xl py-3.5 text-[14px] font-bold transition disabled:opacity-50',
            advanceColor === 'amber' ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' : 'bg-violet-500 text-white hover:bg-violet-600',
          ]"
          @click="requestAdvance"
        >
          <span v-if="!advancing">{{ advanceLabel }}</span>
          <span v-else class="flex items-center justify-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Actualizando…
          </span>
        </button>
      </div>
    </Transition>

    <!-- Error de avance de estado -->
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0">
      <div v-if="advanceError" class="mt-3 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 ring-1 ring-red-200">
        {{ advanceError }}
      </div>
    </Transition>

    <!-- ── Modal de confirmación ── -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="confirmOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40" @click="confirmOpen = false" />
          <!-- Panel -->
          <div class="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-black/10 overflow-hidden">
            <!-- Franja de color superior -->
            <div :class="['h-1.5', advanceColor === 'amber' ? 'bg-amber-400' : 'bg-violet-500']" />
            <div class="px-6 pt-5 pb-6">
              <h3 class="text-[16px] font-bold text-[#111827]">¿Confirmar cambio de estado?</h3>
              <p class="mt-2 text-[13px] text-gray-500 leading-relaxed">
                El pedido <span class="font-semibold text-[#111827]">{{ order?.orderCode }}</span> pasará de
                <span
                  class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold"
                  :style="{ backgroundColor: STATUS_COLORS[order!.status as OrderStatus]?.bg, color: STATUS_COLORS[order!.status as OrderStatus]?.text }"
                >{{ STATUS_LABELS[order!.status as OrderStatus] }}</span>
                a
                <span
                  :class="['inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold', advanceColor === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-violet-100 text-violet-800']"
                >{{ advanceNextLabel }}</span>.
              </p>
              <div class="mt-5 flex gap-3">
                <button
                  type="button"
                  class="flex-1 rounded-xl border border-black/10 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition"
                  @click="confirmOpen = false"
                >Cancelar</button>
                <button
                  type="button"
                  :class="['flex-1 rounded-xl py-2.5 text-[13px] font-bold transition', advanceColor === 'amber' ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' : 'bg-violet-500 text-white hover:bg-violet-600']"
                  @click="advance"
                >Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>
