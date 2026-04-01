<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Crear Pedido · Magnolias' })

import {
  customersService,
  type CustomerItem,
  type CreateCustomerRequest,
} from '~/services/customers.service'
import { branchesService, type BranchResponse } from '~/services/branches.service'
import { catalogsService, type FlowerItem, type ColorItem } from '~/services/catalogs.service'
import { usersService, type UserItem } from '~/services/users.service'

const router = useRouter()

// ─── Stepper ─────────────────────────────────────────────────────────────────
const STEPS = ['Cliente', 'Tipo y logística', 'Productos', 'Pago'] as const
const step = ref(1)

// ─── Draft data (grows as the user advances) ─────────────────────────────────
const selectedCustomer = ref<CustomerItem | null>(null)

// ─── Step 1 — Customer search ─────────────────────────────────────────────────
const phoneQuery  = ref('')
const searching   = ref(false)
const searchError = ref('')
const results     = ref<CustomerItem[]>([])
const hasSearched = ref(false)

async function searchByPhone() {
  const digits = phoneQuery.value.replace(/\D/g, '').trim()
  if (!digits) return
  searching.value   = true
  searchError.value = ''
  hasSearched.value = true
  try {
    const data = await customersService.getCustomers({ phone: digits, isActive: true, limit: 10 })
    results.value = data.items ?? []
  } catch (e: any) {
    searchError.value = e?.message || 'Error al buscar.'
    results.value = []
  } finally {
    searching.value = false
  }
}

function selectCustomer(c: CustomerItem) {
  selectedCustomer.value = c
}

// ─── Step 1 — Inline registration ────────────────────────────────────────────
const showRegister   = ref(false)
const registering    = ref(false)
const registerError  = ref('')
const regForm = reactive({
  fullName: '', phone: '', email: '', notes: '',
  withAddress: false,
  address: { street: '', number: '', neighborhood: '', city: '', postalCode: '', interphoneCode: '', betweenStreets: '', reference: '', addressNotes: '' },
})

watch(showRegister, (open) => {
  if (open) {
    regForm.phone       = phoneQuery.value.trim()
    regForm.fullName    = ''
    regForm.email       = ''
    regForm.notes       = ''
    regForm.withAddress = false
    regForm.address     = { street: '', number: '', neighborhood: '', city: '', postalCode: '', interphoneCode: '', betweenStreets: '', reference: '', addressNotes: '' }
    registerError.value = ''
  }
})

const canRegister = computed(() => {
  if (!regForm.fullName.trim() || !regForm.phone.trim()) return false
  if (regForm.withAddress) {
    if (!regForm.address.street.trim()) return false
    if (!regForm.address.number.trim()) return false
    if (!regForm.address.neighborhood.trim()) return false
  }
  return true
})

async function registerAndSelect() {
  if (!canRegister.value) return
  registering.value    = true
  registerError.value  = ''
  try {
    const payload: CreateCustomerRequest = {
      fullName: regForm.fullName.trim(),
      phone:    regForm.phone.trim(),
      email:    regForm.email.trim() || null,
      notes:    regForm.notes.trim() || null,
      address:  regForm.withAddress ? {
        street:         regForm.address.street.trim(),
        number:         regForm.address.number.trim(),
        neighborhood:   regForm.address.neighborhood.trim(),
        city:           regForm.address.city.trim() || null,
        postalCode:     regForm.address.postalCode.trim() || null,
        interphoneCode: regForm.address.interphoneCode.trim() || null,
        betweenStreets: regForm.address.betweenStreets.trim() || null,
        reference:      regForm.address.reference.trim() || null,
        notes:          regForm.address.addressNotes.trim() || null,
      } : null,
    }
    const created = await customersService.createCustomer(payload)
    selectedCustomer.value = created
    results.value          = [created]
    hasSearched.value      = true
    phoneQuery.value       = created.phone
    showRegister.value     = false
  } catch (e: any) {
    registerError.value = e?.message || 'No se pudo registrar el cliente.'
  } finally {
    registering.value = false
  }
}

// ─── Step 2 — Tipo y logística ───────────────────────────────────────────────
type OrderTypeKey = 'DOMICILIO' | 'VITRINA' | 'FLOR' | 'EVENTO'

const ORDER_TYPES: { key: OrderTypeKey; label: string; sub: string; icon: string }[] = [
  { key: 'DOMICILIO', label: 'Domicilio', sub: 'Entrega a domicilio', icon: 'delivery' },
  { key: 'VITRINA',   label: 'Vitrina',   sub: 'Venta en mostrador', icon: 'shop'     },
  { key: 'FLOR',      label: 'Flor',      sub: 'Pedido con flores',  icon: 'flower'   },
  { key: 'EVENTO',    label: 'Evento',    sub: 'Evento especial',    icon: 'event'    },
]

// Branches for Vitrina pickup selector
const branches = ref<BranchResponse[]>([])
branchesService.getBranches().then(r => { branches.value = r }).catch(() => {})

// Flowers + Colors for FLOR type
const flowerCatalog = ref<FlowerItem[]>([])
const colorCatalog  = ref<ColorItem[]>([])
catalogsService.getFlowers(100, 0, true).then(r => { flowerCatalog.value = r.items }).catch(() => {})
catalogsService.getColors().then(r => { colorCatalog.value = r }).catch(() => {})

// Users for EVENTO responsable del montaje
const usersCatalog = ref<UserItem[]>([])
usersService.getUsers({ limit: 100 }).then(r => { usersCatalog.value = r.items }).catch(() => {})

type FlowerRow = { flowerId: string; colorId: string; quantity: number | ''; note: string }
const flowerRows = ref<FlowerRow[]>([{ flowerId: '', colorId: '', quantity: '', note: '' }])

function addFlowerRow() {
  flowerRows.value.push({ flowerId: '', colorId: '', quantity: '', note: '' })
}
function removeFlowerRow(i: number) {
  if (flowerRows.value.length > 1) flowerRows.value.splice(i, 1)
}

const step2 = reactive({
  orderType:      null as OrderTypeKey | null,
  // delivery (DOMICILIO / FLOR / EVENTO)
  deliveryDate:   '',
  deliveryTime:   '',
  deliveryRound:  '',
  // address mode
  useCustomerAddr: false,
  // new address fields
  newAddr: {
    street: '', number: '', neighborhood: '', city: '',
    postalCode: '', interphoneCode: '', betweenStreets: '',
    reference: '', deliveryNotes: '',
  },
  // override fields
  receiverName:   '',
  receiverPhone:  '',
  interphoneCode: '',
  reference:      '',
  betweenStreets: '',
  deliveryNotes:  '',
  // pickup / VITRINA
  pickupBranchId: '',
  pickupDate:     '',
  pickupTime:     '',
  // EVENTO-specific
  eventMontageDate:    '',
  eventExitTime:       '',
  eventGuestCount:     '' as number | '',
  eventResponsibleId:  '',
  eventServices: { dessertTable: false, cake: false, montage: false },
})

// When customer changes, auto-check "use customer address" if they have one
watch(selectedCustomer, (c) => {
  step2.useCustomerAddr = !!(c?.address?.street)
})

const customerHasAddress = computed(() =>
  !!(selectedCustomer.value?.address?.street)
)

const customerAddressFormatted = computed(() => {
  const a = selectedCustomer.value?.address
  if (!a) return ''
  return [a.street, a.number ? `#${a.number}` : null, a.neighborhood, a.city]
    .filter(Boolean).join(', ')
})

const needsDelivery = computed(() =>
  step2.orderType !== null && step2.orderType !== 'VITRINA'
)

// Address section valid?
const step2AddressValid = computed(() => {
  if (!needsDelivery.value) return true
  if (step2.useCustomerAddr) return true
  return !!(step2.newAddr.street.trim() && step2.newAddr.number.trim() && step2.newAddr.neighborhood.trim())
})

// ─── Navigation ──────────────────────────────────────────────────────────────
const canNext = computed(() => {
  if (step.value === 1) return !!selectedCustomer.value
  if (step.value === 2) {
    if (!step2.orderType) return false
    if (step2.orderType === 'VITRINA') {
      return !!(step2.pickupBranchId && step2.pickupDate)
    }
    if (!step2.deliveryDate) return false
    if (!step2AddressValid.value) return false
    return true
  }
  return true
})

function back() {
  if (step.value === 1) router.push('/admin/pedidos')
  else step.value--
}

function next() {
  if (!canNext.value) return
  if (step.value < STEPS.length) step.value++
}

function formatCustomerAddress(c: CustomerItem) {
  const a = c.address
  if (!a) return ''
  return [a.street, a.number ? `#${a.number}` : null, a.neighborhood, a.city]
    .filter(Boolean).join(', ')
}
</script>

<template>
  <section class="min-h-[calc(100vh-86px)] bg-[#F3F3F4] font-sans">
    <div class="mx-auto w-full max-w-[1100px] px-4 py-6 lg:px-8 lg:py-8">

      <!-- ── Page header ──────────────────────────────────────────────────── -->
      <div class="flex items-center gap-3 mb-7">
        <button
          type="button"
          class="grid h-9 w-9 place-items-center rounded-xl bg-white ring-1 ring-black/10 hover:bg-black/5 transition text-[#111827]"
          title="Atrás"
          @click="back"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <h1 class="text-[22px] font-bold text-[#111827]">Crear Pedido</h1>
      </div>

      <!-- ── Stepper ───────────────────────────────────────────────────────── -->
      <div class="mb-8">
        <div class="flex items-center">
          <template v-for="(label, idx) in STEPS" :key="label">
            <!-- Bubble -->
            <div class="flex flex-col items-center gap-1.5">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold transition-all duration-300"
                :class="idx + 1 > step ? 'bg-gray-200 text-gray-400' : 'text-white'"
                :style="idx + 1 <= step ? { backgroundColor: '#FC9AD3' } : {}"
              >
                <svg v-if="idx + 1 < step" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span
                class="hidden sm:block text-[11px] font-semibold whitespace-nowrap transition-colors"
                :class="idx + 1 <= step ? 'text-[#d4739f]' : 'text-gray-400'"
              >{{ label }}</span>
            </div>

            <!-- Connector (not after last) -->
            <div
              v-if="idx < STEPS.length - 1"
              class="flex-1 h-0.5 mx-2 mb-4 sm:mb-0 rounded-full transition-all duration-300"
              :style="idx + 1 < step ? { backgroundColor: '#FC9AD3' } : { backgroundColor: '#e5e7eb' }"
            />
          </template>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- STEP 1 — Cliente                                                   -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div v-if="step === 1" class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden">

        <div class="px-6 py-5 border-b border-black/10">
          <h2 class="text-[18px] font-bold text-[#111827]">Paso 1: Información del Cliente</h2>
          <p class="mt-0.5 text-[13px] text-gray-400">Busca el cliente por teléfono o regístralo si es nuevo.</p>
        </div>

        <div class="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:divide-x lg:divide-black/10">

          <!-- ── Left: search + optional register form ────────────────────── -->
          <div class="space-y-5 lg:pr-8">

            <!-- Phone input -->
            <div>
              <label class="block text-[13px] font-semibold text-gray-600 mb-2">Teléfono:</label>
              <div class="relative">
                <input
                  v-model="phoneQuery"
                  type="tel"
                  inputmode="numeric"
                  class="w-full h-12 rounded-xl px-4 pr-12 text-[14px] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50 placeholder:text-gray-400 transition"
                  placeholder="Ingresa número de teléfono"
                  @keydown.enter="searchByPhone"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg hover:bg-black/5 transition"
                  :class="searching ? 'text-[#FC9AD3]' : 'text-gray-400'"
                  @click="searchByPhone"
                >
                  <div v-if="searching" class="h-4 w-4 rounded-full border-2 border-black/10 border-t-[#FC9AD3] animate-spin" />
                  <svg v-else viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="M21 21l-4.3-4.3"/>
                  </svg>
                </button>
              </div>
              <p class="mt-1.5 text-[12px] text-gray-400">Presiona Enter o el ícono para buscar.</p>
              <div v-if="searchError" class="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-700 ring-1 ring-red-200">
                {{ searchError }}
              </div>
            </div>

            <!-- Not-registered toggle -->
            <button
              type="button"
              class="flex items-center gap-2.5 text-[13px] font-semibold transition-colors"
              :style="showRegister ? { color: '#d4739f' } : { color: '#6b7280' }"
              @click="showRegister = !showRegister"
            >
              <span
                class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all"
                :style="showRegister
                  ? { borderColor: '#FC9AD3', backgroundColor: '#FC9AD3' }
                  : { borderColor: '#d1d5db', backgroundColor: '#fff' }"
              >
                <svg v-if="showRegister" viewBox="0 0 24 24" class="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </span>
              ¿No está registrado?
            </button>

            <!-- Inline register form -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-2"
            >
              <div v-if="showRegister" class="rounded-2xl ring-1 ring-black/10 bg-[#FAFAFA] p-5 space-y-4">
                <div class="flex items-center gap-2">
                  <div class="h-7 w-7 rounded-full grid place-items-center" style="background-color:#FC9AD3">
                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </div>
                  <p class="text-[14px] font-bold text-[#111827]">Registrar cliente</p>
                </div>

                <div v-if="registerError" class="rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-700 ring-1 ring-red-200">
                  {{ registerError }}
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="sm:col-span-2">
                    <label class="block text-[12px] font-semibold text-gray-500 mb-1">Nombre completo *</label>
                    <input
                      v-model="regForm.fullName"
                      class="w-full h-10 rounded-xl px-3 text-[13px] bg-white ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                      placeholder="Ej. Ana García López"
                    />
                  </div>
                  <div>
                    <label class="block text-[12px] font-semibold text-gray-500 mb-1">Teléfono *</label>
                    <input
                      v-model="regForm.phone"
                      inputmode="numeric"
                      class="w-full h-10 rounded-xl px-3 text-[13px] bg-white ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                      placeholder="Ej. 6441234567"
                    />
                  </div>
                  <div>
                    <label class="block text-[12px] font-semibold text-gray-500 mb-1">Correo (opcional)</label>
                    <input
                      v-model="regForm.email"
                      type="email"
                      class="w-full h-10 rounded-xl px-3 text-[13px] bg-white ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                      placeholder="ana@correo.com"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-[12px] font-semibold text-gray-500 mb-1">Notas (opcional)</label>
                    <textarea
                      v-model="regForm.notes"
                      rows="2"
                      class="w-full rounded-xl px-3 py-2 text-[13px] bg-white ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50 resize-none"
                      placeholder="Ej. Prefiere entregas matutinas"
                    />
                  </div>
                </div>

                <!-- Address toggle -->
                <div class="flex items-center justify-between rounded-xl bg-white ring-1 ring-black/10 px-4 py-3">
                  <div class="pr-4">
                    <p class="text-[13px] font-semibold text-[#111827]">Agregar dirección</p>
                    <p class="text-[11px] text-gray-400">Calle, número y colonia son obligatorios si activas esta opción.</p>
                  </div>
                  <button
                    type="button"
                    class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition"
                    :style="regForm.withAddress ? { backgroundColor: '#FC9AD3' } : { backgroundColor: 'rgba(0,0,0,0.15)' }"
                    @click="regForm.withAddress = !regForm.withAddress"
                    aria-label="Toggle dirección"
                  >
                    <span
                      class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                      :class="regForm.withAddress ? 'translate-x-6' : 'translate-x-1'"
                    />
                  </button>
                </div>

                <!-- Address fields -->
                <div v-if="regForm.withAddress" class="rounded-xl bg-white ring-1 ring-black/10 p-4 space-y-3">
                  <p class="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Dirección</p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Calle *</label>
                      <input
                        v-model="regForm.address.street"
                        class="w-full h-10 rounded-xl px-3 text-[13px] bg-[#F8F8F9] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                        placeholder="Ej. Calle Juárez"
                      />
                    </div>
                    <div>
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Número *</label>
                      <input
                        v-model="regForm.address.number"
                        class="w-full h-10 rounded-xl px-3 text-[13px] bg-[#F8F8F9] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                        placeholder="Ej. 123"
                      />
                    </div>
                    <div>
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Colonia *</label>
                      <input
                        v-model="regForm.address.neighborhood"
                        class="w-full h-10 rounded-xl px-3 text-[13px] bg-[#F8F8F9] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                        placeholder="Ej. Col. Centro"
                      />
                    </div>
                    <div>
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Ciudad (opcional)</label>
                      <input
                        v-model="regForm.address.city"
                        class="w-full h-10 rounded-xl px-3 text-[13px] bg-[#F8F8F9] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                        placeholder="Ej. Guadalajara"
                      />
                    </div>
                    <div>
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">CP (opcional)</label>
                      <input
                        v-model="regForm.address.postalCode"
                        inputmode="numeric"
                        class="w-full h-10 rounded-xl px-3 text-[13px] bg-[#F8F8F9] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                        placeholder="Ej. 44100"
                      />
                    </div>
                    <div>
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Código interfón (opcional)</label>
                      <input
                        v-model="regForm.address.interphoneCode"
                        class="w-full h-10 rounded-xl px-3 text-[13px] bg-[#F8F8F9] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                        placeholder="Ej. 1234#"
                      />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Entre calles (opcional)</label>
                      <input
                        v-model="regForm.address.betweenStreets"
                        class="w-full h-10 rounded-xl px-3 text-[13px] bg-[#F8F8F9] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                        placeholder="Ej. Entre Morelos y Juárez"
                      />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Referencia (opcional)</label>
                      <input
                        v-model="regForm.address.reference"
                        class="w-full h-10 rounded-xl px-3 text-[13px] bg-[#F8F8F9] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50"
                        placeholder="Ej. Cerca del parque"
                      />
                    </div>
                    <div class="sm:col-span-2">
                      <label class="block text-[12px] font-semibold text-gray-500 mb-1">Notas dirección (opcional)</label>
                      <textarea
                        v-model="regForm.address.addressNotes"
                        rows="2"
                        class="w-full rounded-xl px-3 py-2 text-[13px] bg-[#F8F8F9] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50 resize-none"
                        placeholder="Ej. Tocar el timbre dos veces"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  class="w-full h-11 rounded-xl text-[13px] font-bold text-white transition disabled:opacity-50"
                  style="background-color:#FC9AD3"
                  :disabled="!canRegister || registering"
                  @click="registerAndSelect"
                >
                  <span v-if="registering" class="flex items-center justify-center gap-2">
                    <span class="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin inline-block" />
                    Registrando…
                  </span>
                  <span v-else>Registrar y seleccionar →</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- ── Right: results ────────────────────────────────────────────── -->
          <div class="lg:pl-8">
            <p class="text-[13px] font-semibold text-gray-600 mb-3">Seleccionar cliente</p>

            <!-- Idle -->
            <div
              v-if="!hasSearched && !searching"
              class="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200"
            >
              <svg viewBox="0 0 24 24" class="h-10 w-10 text-gray-200 mb-3" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="7"/>
                <path d="M21 21l-4.3-4.3"/>
              </svg>
              <p class="text-[13px] text-gray-400">Busca un cliente por teléfono</p>
            </div>

            <!-- Searching -->
            <div v-else-if="searching" class="flex justify-center py-16">
              <div class="h-6 w-6 rounded-full border-2 border-black/10 border-t-[#FC9AD3] animate-spin" />
            </div>

            <!-- No results -->
            <div
              v-else-if="hasSearched && results.length === 0"
              class="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-gray-200"
            >
              <svg viewBox="0 0 24 24" class="h-10 w-10 text-gray-200 mb-3" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <p class="text-[13px] font-medium text-gray-500">Ningún cliente encontrado</p>
              <p class="mt-1 text-[12px] text-gray-400">Usa "¿No está registrado?" para crearlo aquí</p>
            </div>

            <!-- Results -->
            <div v-else class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              <button
                v-for="c in results"
                :key="c.id"
                type="button"
                class="w-full text-left rounded-2xl border-2 p-4 transition-all duration-150 hover:shadow-sm"
                :style="selectedCustomer?.id === c.id
                  ? { borderColor: '#FC9AD3', backgroundColor: '#fff5fb' }
                  : { borderColor: '#e5e7eb', backgroundColor: '#fff' }"
                @click="selectCustomer(c)"
              >
                <!-- Name + phone -->
                <div class="flex items-center justify-between gap-2 flex-wrap">
                  <p class="text-[14px] font-bold text-[#111827]">{{ c.fullName }}</p>
                  <span class="flex items-center gap-1 text-[13px] font-semibold" style="color:#FC9AD3">
                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6.29 6.29l1.28-1.28a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.28 17z"/>
                    </svg>
                    {{ c.phone }}
                  </span>
                </div>

                <!-- Email + notes -->
                <div class="mt-2 space-y-1">
                  <div v-if="c.email" class="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <path d="M22 6l-10 7L2 6"/>
                    </svg>
                    {{ c.email }}
                  </div>
                  <div v-if="c.notes" class="flex items-center gap-1.5 text-[12px] text-gray-500">
                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <path d="M7 8h10M7 12h10M7 16h6"/>
                    </svg>
                    {{ c.notes }}
                  </div>
                  <!-- Address -->
                  <div v-if="formatCustomerAddress(c)" class="flex items-start gap-1.5 text-[12px] text-gray-500">
                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-gray-400 mt-0.5" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    {{ formatCustomerAddress(c) }}
                  </div>
                  <div v-else class="flex items-center gap-1.5 text-[12px] text-gray-300 italic">
                    <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    Sin dirección registrada
                  </div>
                </div>

                <!-- Selected indicator -->
                <div
                  v-if="selectedCustomer?.id === c.id"
                  class="mt-3 flex items-center gap-1.5 text-[12px] font-semibold"
                  style="color:#FC9AD3"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Cliente seleccionado
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- STEP 2 — Tipo y logística                                         -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div
        v-else-if="step === 2"
        class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-5 border-b border-black/10">
          <h2 class="text-[18px] font-bold text-[#111827]">Tipo y logística</h2>
          <p class="mt-0.5 text-[13px] text-gray-400">Elige el tipo de pedido y, si aplica, los detalles de entrega</p>
        </div>

        <div class="px-6 py-6 space-y-8">

          <!-- ── Tipo de pedido ──────────────────────────────────────────── -->
          <fieldset>
            <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Tipo de pedido
            </legend>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                v-for="t in ORDER_TYPES"
                :key="t.key"
                type="button"
                @click="step2.orderType = t.key"
                :class="[
                  'relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 transition-all',
                  step2.orderType === t.key
                    ? 'border-[#FC9AD3] bg-pink-50 shadow-sm'
                    : 'border-black/10 hover:border-[#FC9AD3]/60 hover:bg-pink-50/40'
                ]"
              >
                <!-- Checkmark badge -->
                <span
                  v-if="step2.orderType === t.key"
                  class="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FC9AD3]"
                >
                  <svg viewBox="0 0 12 12" class="h-2.5 w-2.5" fill="none" stroke="white" stroke-width="2">
                    <path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>

                <!-- Icon -->
                <span class="text-2xl leading-none select-none">
                  <template v-if="t.icon === 'delivery'">🛵</template>
                  <template v-else-if="t.icon === 'shop'">🏪</template>
                  <template v-else-if="t.icon === 'flower'">🌸</template>
                  <template v-else-if="t.icon === 'event'">🎉</template>
                  <template v-else>📦</template>
                </span>

                <span class="text-[13px] font-semibold text-[#111827] text-center">{{ t.label }}</span>
                <span class="text-[11px] text-gray-400 text-center leading-tight">{{ t.sub }}</span>
              </button>
            </div>
          </fieldset>

          <!-- ── Vitrina: Logística de Recolección ──────────────────────── -->
          <fieldset v-if="step2.orderType === 'VITRINA'" class="space-y-0">
            <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Logística de Recolección
            </legend>
            <div class="divide-y divide-black/8 rounded-xl border border-black/10 overflow-hidden">
              <!-- Sucursal -->
              <div class="flex items-center gap-3 px-4 py-3 bg-white">
                <svg viewBox="0 0 24 24" class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke-linejoin="round"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                <label class="text-[13px] font-medium text-gray-700 w-36 flex-shrink-0">Sucursal</label>
                <div class="relative flex-1">
                  <select
                    v-model="step2.pickupBranchId"
                    class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
                  >
                    <option value="" disabled>Selecciona sucursal</option>
                    <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
                  </select>
                  <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <!-- Fecha + Hora -->
              <div class="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-white">
                <div class="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                  </svg>
                  <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Fecha de recolección</label>
                  <input
                    v-model="step2.pickupDate"
                    type="date"
                    class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                  />
                </div>
                <div class="flex items-center gap-3">
                  <svg viewBox="0 0 24 24" class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]" fill="none" stroke="currentColor" stroke-width="1.8">
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 3"/>
                  </svg>
                  <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Hora de recolección</label>
                  <input
                    v-model="step2.pickupTime"
                    type="time"
                    class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                  />
                </div>
              </div>
            </div>
          </fieldset>

          <!-- ── Detalles de la entrega (DOMICILIO / FLOR / EVENTO / PERSONALIZADO) ── -->
          <template v-if="needsDelivery">

            <!-- Logística / Detalles de la entrega -->
            <fieldset class="space-y-0">
              <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {{ step2.orderType === 'EVENTO' ? 'Logística del evento' : 'Detalles de la entrega' }}
              </legend>
              <div class="divide-y divide-black/8 rounded-xl border border-black/10 overflow-hidden">

                <!-- Ronda de entrega (EVENTO) -->
                <div v-if="step2.orderType === 'EVENTO'" class="flex items-center gap-3 px-4 py-3 bg-white">
                  <svg viewBox="0 0 24 24" class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]" fill="none" stroke="currentColor" stroke-width="1.8">
                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <label class="text-[13px] font-medium text-gray-700 w-36 flex-shrink-0">Ronda de entrega</label>
                  <div class="relative flex-1">
                    <select
                      v-model="step2.deliveryRound"
                      class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
                    >
                      <option value="" disabled>Selecciona ronda</option>
                      <option value="mañana">Mañana</option>
                      <option value="tarde">Tarde</option>
                      <option value="noche">Noche</option>
                    </select>
                    <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>

                <!-- Fecha + Hora -->
                <div class="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-white">
                  <div class="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]" fill="none" stroke="currentColor" stroke-width="1.8">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">
                      {{ step2.orderType === 'EVENTO' ? 'Fecha del evento' : 'Fecha de entrega' }}
                      <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="step2.deliveryDate"
                      type="date"
                      class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]" fill="none" stroke="currentColor" stroke-width="1.8">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 7v5l3 3"/>
                    </svg>
                    <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">
                      {{ step2.orderType === 'EVENTO' ? 'Hora del evento' : 'Hora de entrega' }}
                    </label>
                    <input
                      v-model="step2.deliveryTime"
                      type="time"
                      class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                </div>

                <!-- Hora del montaje + Hora de salida (EVENTO) -->
                <div v-if="step2.orderType === 'EVENTO'" class="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-white">
                  <div class="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]" fill="none" stroke="currentColor" stroke-width="1.8">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Hora del montaje</label>
                    <input
                      v-model="step2.eventMontageDate"
                      type="date"
                      class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]" fill="none" stroke="currentColor" stroke-width="1.8">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 7v5l3 3"/>
                    </svg>
                    <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Hora de salida</label>
                    <input
                      v-model="step2.eventExitTime"
                      type="time"
                      class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                </div>

              </div>
            </fieldset>

            <!-- Dirección de entrega -->
            <fieldset class="space-y-3">
              <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Dirección de entrega
              </legend>

              <!-- Checkbox: usar dirección del cliente -->
              <label
                :class="[
                  'flex items-center gap-2.5 cursor-pointer select-none',
                  !customerHasAddress && 'opacity-40 pointer-events-none'
                ]"
              >
                <input
                  v-model="step2.useCustomerAddr"
                  type="checkbox"
                  :disabled="!customerHasAddress"
                  class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
                />
                <span class="text-[13px] text-gray-700">
                  Usar la dirección del cliente registrada
                  <span v-if="!customerHasAddress" class="text-gray-400">(el cliente no tiene dirección registrada)</span>
                </span>
              </label>

              <!-- Dirección pre-rellenada del cliente -->
              <div
                v-if="step2.useCustomerAddr && customerHasAddress"
                class="rounded-lg bg-pink-50 border border-[#FC9AD3]/40 px-4 py-3 flex items-start gap-2"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4 mt-0.5 flex-shrink-0 text-[#C9007C]" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                <span class="text-[13px] text-gray-700">{{ customerAddressFormatted }}</span>
              </div>

              <!-- Manual address form -->
              <template v-if="!step2.useCustomerAddr">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[13px] font-medium text-gray-600">
                      Calle <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="step2.newAddr.street"
                      type="text"
                      placeholder="Av. Principal"
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[13px] font-medium text-gray-600">
                      Número exterior <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="step2.newAddr.number"
                      type="text"
                      placeholder="123"
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[13px] font-medium text-gray-600">
                      Colonia <span class="text-red-400">*</span>
                    </label>
                    <input
                      v-model="step2.newAddr.neighborhood"
                      type="text"
                      placeholder="Col. Centro"
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[13px] font-medium text-gray-600">Ciudad</label>
                    <input
                      v-model="step2.newAddr.city"
                      type="text"
                      placeholder="CDMX"
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[13px] font-medium text-gray-600">Código postal</label>
                    <input
                      v-model="step2.newAddr.postalCode"
                      type="text"
                      maxlength="5"
                      placeholder="06600"
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                </div>

                <!-- Additional address fields (collapsible-style, always visible) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div class="flex flex-col gap-1">
                    <label class="text-[13px] font-medium text-gray-600">Entre calles</label>
                    <input
                      v-model="step2.newAddr.betweenStreets"
                      type="text"
                      placeholder="Entre Av. A y Av. B"
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[13px] font-medium text-gray-600">Código de interfón</label>
                    <input
                      v-model="step2.newAddr.interphoneCode"
                      type="text"
                      placeholder="#1234"
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex flex-col gap-1 sm:col-span-2">
                    <label class="text-[13px] font-medium text-gray-600">Referencia</label>
                    <input
                      v-model="step2.newAddr.reference"
                      type="text"
                      placeholder="Casa color azul, junto a la tienda..."
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                </div>
              </template>

              <!-- Delivery overrides (always shown when address is set) -->
              <div
                v-if="step2.useCustomerAddr || (step2.newAddr.street && step2.newAddr.number)"
                class="border-t border-dashed border-black/10 pt-4 space-y-3"
              >
                <p class="text-[12px] font-semibold text-gray-400 uppercase tracking-wide">Para esta entrega (opcional)</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[13px] font-medium text-gray-600">Nombre de quien recibe</label>
                    <input
                      v-model="step2.receiverName"
                      type="text"
                      placeholder="Nombre del receptor"
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[13px] font-medium text-gray-600">Teléfono de quien recibe</label>
                    <input
                      v-model="step2.receiverPhone"
                      type="tel"
                      maxlength="10"
                      placeholder="5512345678"
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <div class="flex flex-col gap-1 sm:col-span-2">
                    <label class="text-[13px] font-medium text-gray-600">Indicaciones para el repartidor</label>
                    <textarea
                      v-model="step2.deliveryNotes"
                      rows="2"
                      placeholder="Instrucciones especiales para la entrega..."
                      class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white resize-none"
                    />
                  </div>
                </div>
              </div>

            </fieldset>

            <!-- ── Flores del Pedido (sólo FLOR) ──────────────────────── -->
            <fieldset v-if="step2.orderType === 'FLOR'">
              <div class="flex items-center gap-2 mb-3">
                <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Flores del Pedido</legend>
                <button
                  type="button"
                  @click="addFlowerRow"
                  class="flex items-center justify-center h-6 w-6 rounded-full bg-[#FC9AD3]/20 hover:bg-[#FC9AD3]/40 text-[#C9007C] transition-colors"
                  title="Agregar flor"
                >
                  <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M12 5v14M5 12h14" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="(row, i) in flowerRows"
                  :key="i"
                  class="flex items-center gap-2 rounded-xl ring-1 ring-black/10 bg-white px-3 py-2"
                >
                  <!-- Label -->
                  <span class="text-[12px] font-semibold text-gray-400 w-12 flex-shrink-0">Flor {{ i + 1 }}</span>

                  <!-- Selecciona flor -->
                  <div class="relative flex-1 min-w-0">
                    <select
                      v-model="row.flowerId"
                      class="w-full appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
                    >
                      <option value="" disabled>Selecciona flor</option>
                      <option v-for="f in flowerCatalog" :key="f.id" :value="f.id">{{ f.name }}</option>
                    </select>
                    <svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>

                  <!-- Color -->
                  <div class="relative w-24 flex-shrink-0">
                    <select
                      v-model="row.colorId"
                      class="w-full appearance-none rounded-lg bg-[#F3F3F4] pl-2.5 pr-7 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
                    >
                      <option value="" disabled>Color</option>
                      <option v-for="c in colorCatalog" :key="c.id" :value="c.id">{{ c.name }}</option>
                    </select>
                    <svg class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>

                  <!-- Cantidad -->
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <input
                      v-model.number="row.quantity"
                      type="number"
                      min="1"
                      placeholder="Cant"
                      class="w-14 rounded-lg bg-[#F3F3F4] px-2 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 text-center"
                    />
                  </div>

                  <!-- Nota -->
                  <input
                    v-model="row.note"
                    type="text"
                    placeholder="Nota"
                    class="flex-1 min-w-0 rounded-lg bg-[#F3F3F4] px-2.5 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60"
                  />

                  <!-- Quitar -->
                  <button
                    v-if="flowerRows.length > 1"
                    type="button"
                    @click="removeFlowerRow(i)"
                    class="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                    title="Quitar fila"
                  >
                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M8 12h8" stroke-linecap="round"/>
                    </svg>
                  </button>
                  <!-- Spacer when only 1 row -->
                  <span v-else class="h-4 w-4 flex-shrink-0"/>
                </div>
              </div>
            </fieldset>

            <!-- ── Servicios (EVENTO) ─────────────────────────────────────── -->
            <fieldset v-if="step2.orderType === 'EVENTO'">
              <div class="flex items-center gap-3 mb-3">
                <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Servicios</legend>
                <span v-if="step2.deliveryDate" class="text-[12px] text-gray-400">{{ step2.deliveryDate }}</span>
              </div>
              <div class="flex flex-wrap items-center gap-4 rounded-xl border border-black/10 bg-white px-5 py-4">
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    v-model="step2.eventServices.dessertTable"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
                  />
                  <span class="text-[13px] text-gray-700">Mesa de Postres</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    v-model="step2.eventServices.cake"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
                  />
                  <span class="text-[13px] text-gray-700">Pastel</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    v-model="step2.eventServices.montage"
                    type="checkbox"
                    class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
                  />
                  <span class="text-[13px] text-gray-700">Montaje</span>
                </label>
              </div>
            </fieldset>

            <!-- ── Detalles del Evento (EVENTO) ──────────────────────────── -->
            <fieldset v-if="step2.orderType === 'EVENTO'">
              <legend class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3">Detalles del Evento</legend>
              <div class="rounded-xl border border-black/10 bg-white px-5 py-4">
                <div class="flex flex-wrap items-center gap-4">
                  <!-- Número de invitados -->
                  <div class="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Número de invitados</label>
                    <input
                      v-model.number="step2.eventGuestCount"
                      type="number"
                      min="1"
                      placeholder="150"
                      class="w-24 rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
                    />
                  </div>
                  <!-- Responsable del montaje -->
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">Responsable del montaje</label>
                    <div class="relative flex-1 min-w-[160px]">
                      <select
                        v-model="step2.eventResponsibleId"
                        class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
                      >
                        <option value="" disabled>Selecciona responsable</option>
                        <option v-for="u in usersCatalog" :key="u.id" :value="u.id">{{ u.name }} {{ u.lastname }}</option>
                      </select>
                      <svg class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>

          </template>

        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- STEP 3 — Productos (placeholder)                                  -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div
        v-else-if="step === 3"
        class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden"
      >
        <div class="px-6 py-5 border-b border-black/10">
          <h2 class="text-[18px] font-bold text-[#111827]">Paso 3: Productos</h2>
          <p class="mt-0.5 text-[13px] text-gray-400">Próximamente</p>
        </div>
        <div class="px-6 py-16 flex flex-col items-center text-gray-300">
          <svg viewBox="0 0 24 24" class="h-14 w-14 mb-4" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p class="text-[14px] text-gray-400">Esta sección está en construcción</p>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════ -->
      <!-- STEP 4 — Pago (placeholder)                                       -->
      <!-- ══════════════════════════════════════════════════════════════════ -->
      <div
        v-else-if="step === 4"
        class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden"
      >
        <div class="px-6 py-5 border-b border-black/10">
          <h2 class="text-[18px] font-bold text-[#111827]">Paso 4: Pago</h2>
          <p class="mt-0.5 text-[13px] text-gray-400">Próximamente</p>
        </div>
        <div class="px-6 py-16 flex flex-col items-center text-gray-300">
          <svg viewBox="0 0 24 24" class="h-14 w-14 mb-4" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="1" y="4" width="22" height="16" rx="2"/>
            <path d="M1 10h22"/>
          </svg>
          <p class="text-[14px] text-gray-400">Esta sección está en construcción</p>
        </div>
      </div>

      <!-- ── Selected customer summary bar (steps 2–4) ─────────────────── -->
      <div
        v-if="step > 1 && selectedCustomer"
        class="mt-4 rounded-2xl bg-white ring-1 ring-black/10 px-5 py-3 flex items-center gap-3"
      >
        <div class="h-8 w-8 shrink-0 rounded-full grid place-items-center font-bold text-[12px] text-white" style="background-color:#FC9AD3">
          {{ selectedCustomer.fullName.slice(0, 2).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <p class="text-[13px] font-semibold text-[#111827] truncate">{{ selectedCustomer.fullName }}</p>
          <p class="text-[12px] text-gray-400">{{ selectedCustomer.phone }}</p>
        </div>
        <button
          type="button"
          class="ml-auto text-[12px] font-semibold transition-colors"
          style="color:#FC9AD3"
          @click="step = 1"
        >
          Cambiar
        </button>
      </div>

      <!-- ── Footer navigation ─────────────────────────────────────────────── -->
      <div class="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          class="h-11 px-6 rounded-xl text-[14px] font-semibold bg-white ring-1 ring-black/10 text-[#111827] hover:bg-black/5 transition"
          @click="back"
        >
          {{ step === 1 ? 'Cancelar' : '← Atrás' }}
        </button>

        <!-- Hint when disabled -->
        <div class="flex flex-col items-end gap-1">
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-1"
          >
            <p v-if="step === 1 && !selectedCustomer" class="text-[12px] text-gray-400">
              Selecciona un cliente para continuar
            </p>
          </Transition>

          <button
            type="button"
            class="h-11 px-7 rounded-xl text-[14px] font-bold text-white transition disabled:opacity-40"
            style="background-color:#FC9AD3"
            :disabled="!canNext"
            @click="next"
          >
            {{ step === STEPS.length ? 'Confirmar pedido ✓' : 'Siguiente →' }}
          </button>
        </div>
      </div>

    </div>
  </section>
</template>
