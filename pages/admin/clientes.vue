<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Clientes · Magnolias' })

import { computed, onMounted, ref, watch } from 'vue'
import { customersService, type CustomerItem } from '~/services/customers.service'
import ConfirmModal from '~/components/ConfirmModal.vue'
import CatalogEditModal, { type CatalogEditPayload } from '~/components/CatalogEditModal.vue'

const loading = ref(true)
const errorMsg = ref('')

const customers = ref<CustomerItem[]>([])
const pagination = ref({
  limit: 10,
  offset: 0,
  totalPages: 1,
  currentPage: 1,
  total: 0,
})

/** ===== Buscador (teléfono) ===== */
const phoneQuery = ref('')
const debouncedPhone = ref('')
let t: any = null

watch(phoneQuery, (v) => {
  clearTimeout(t)
  t = setTimeout(() => (debouncedPhone.value = v.trim()), 350)
})

function clearSearch() {
  phoneQuery.value = ''
  debouncedPhone.value = ''
}

/** ===== Carga ===== */
async function loadCustomers(reset = false) {
  loading.value = true
  errorMsg.value = ''

  try {
    if (reset) {
      pagination.value.offset = 0
      customers.value = []
    }

    const data = await customersService.getCustomers({
      phone: debouncedPhone.value || undefined,
      isActive: true,
      limit: pagination.value.limit,
      offset: pagination.value.offset,
    })

    customers.value = (data.items ?? []).filter(x => x.isActive)

    pagination.value.totalPages = data.pagination.totalPages
    pagination.value.currentPage = data.pagination.currentPage
    pagination.value.total = data.total
  } catch (e: any) {
    console.error(e)
    errorMsg.value = e?.message || 'Ocurrió un error cargando clientes.'
  } finally {
    loading.value = false
  }
}

watch(debouncedPhone, () => loadCustomers(true))
onMounted(() => loadCustomers(true))

/** ===== Helpers UI ===== */
function formatAddress(c: CustomerItem) {
  const a = c.address
  if (!a) return '—'
  const parts = [
    a.street,
    a.number ? `#${a.number}` : null,
    a.neighborhood,
    a.city,
  ].filter(Boolean)
  return parts.length ? parts.join(' ') : '—'
}

function shortText(v: string | null | undefined, max = 32) {
  if (!v) return '—'
  const s = String(v)
  return s.length > max ? `${s.slice(0, max)}…` : s
}

/** ===== Modal "ver más" ===== */
const detailOpen = ref(false)
const detailTitle = ref('')
const detailText = ref('')

function openDetail(title: string, text: string) {
  detailTitle.value = title
  detailText.value = text
  detailOpen.value = true
}

/** ===== Crear cliente (placeholder) ===== */
const createOpen = ref(false)
const createModel = ref<CatalogEditPayload | null>(null)

function openCreate() {
  createModel.value = { name: '', description: '' }
  createOpen.value = true
}

async function onCreateSave() {
  createOpen.value = false
}

/** ===== Paginación ===== */
const canPrev = computed(() => pagination.value.offset > 0)
const canNext = computed(() => pagination.value.currentPage < pagination.value.totalPages)

const showingFrom = computed(() => (pagination.value.total === 0 ? 0 : pagination.value.offset + 1))
const showingTo = computed(() => Math.min(pagination.value.offset + customers.value.length, pagination.value.total))

async function prevPage() {
  if (!canPrev.value) return
  pagination.value.offset = Math.max(0, pagination.value.offset - pagination.value.limit)
  await loadCustomers(false)
}

async function nextPage() {
  if (!canNext.value) return
  pagination.value.offset += pagination.value.limit
  await loadCustomers(false)
}
</script>

<template>
  <section class="min-h-[calc(100vh-64px)] bg-[#F3F3F4] font-sans">
    <div class="mx-auto w-full max-w-[1220px] px-4 py-6 lg:px-10 lg:py-8">

      <!-- Card principal (como en tu mock) -->
      <div class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden">

        <!-- Header: Registros + buscador EN LA MISMA LÍNEA -->
        <div class="px-6 py-5 border-b border-black/10">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <h2 class="text-[20px] font-semibold text-[#111827]">Registros</h2>

              <button
                type="button"
                class="grid h-9 w-9 place-items-center rounded-xl bg-white ring-1 ring-black/10 text-[#111827] hover:bg-black/5 transition"
                @click="openCreate"
                aria-label="Agregar cliente"
                title="Agregar cliente"
              >
                <span class="text-[18px] leading-none">+</span>
              </button>
            </div>

            <!-- Search (derecha, como en la imagen) -->
            <div class="relative w-[360px] max-w-[46vw]">
              <input
                v-model="phoneQuery"
                type="text"
                inputmode="numeric"
                class="w-full h-10 rounded-xl bg-white pl-10 pr-10 text-[14px] text-[#111827] placeholder:text-gray-400 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/10"
                placeholder="Buscar por teléfono"
              />

              <svg
                viewBox="0 0 24 24"
                class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="11" cy="11" r="7"></circle>
                <path d="M21 21l-4.3-4.3"></path>
              </svg>

              <button
                v-if="phoneQuery"
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-lg hover:bg-black/5 text-gray-500"
                @click="clearSearch"
                aria-label="Limpiar"
                title="Limpiar"
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5">
          <div
            v-if="errorMsg"
            class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 ring-1 ring-red-200"
          >
            {{ errorMsg }}
          </div>

          <div v-if="loading" class="py-12 text-center text-[13px] text-gray-500">
            Cargando…
          </div>

          <div v-else>
            <!-- ===== WEB: TABLA SIEMPRE (desde sm+) ===== -->
            <div class="hidden sm:block rounded-xl ring-1 ring-black/10 bg-white overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full text-left table-fixed">
                  <thead class="bg-white">
                    <tr class="border-b border-black/10">
                      <th class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[26%]">Nombre</th>
                      <th class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[16%]">Teléfono</th>
                      <th class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[20%]">Correo</th>
                      <th class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[22%]">Dirección</th>
                      <th class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[16%]">Notas</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="c in customers"
                      :key="c.id"
                      class="border-b border-black/5 last:border-b-0 hover:bg-[#FAFAFB] transition"
                    >
                      <td class="px-4 py-3 text-[13px] text-[#111827] truncate">
                        {{ c.fullName }}
                      </td>

                      <td class="px-4 py-3 text-[13px] text-[#111827] whitespace-nowrap">
                        {{ c.phone }}
                      </td>

                      <td class="px-4 py-3 text-[13px] text-gray-700 truncate">
                        {{ c.email || '—' }}
                      </td>

                      <td class="px-4 py-3 text-[13px] text-gray-700">
                        <div class="flex items-center gap-2">
                          <span class="truncate max-w-[260px]">{{ shortText(formatAddress(c), 36) }}</span>
                          <button
                            v-if="formatAddress(c) !== '—' && formatAddress(c).length > 36"
                            class="shrink-0 text-[12px] font-semibold text-[#111827] hover:underline"
                            type="button"
                            @click="openDetail('Dirección', formatAddress(c))"
                          >
                            Ver más…
                          </button>
                        </div>
                      </td>

                      <td class="px-4 py-3 text-[13px] text-gray-700">
                        <div class="flex items-center gap-2">
                          <span class="truncate max-w-[180px]">{{ shortText(c.notes, 24) }}</span>
                          <button
                            v-if="(c.notes || '').length > 24"
                            class="shrink-0 text-[12px] font-semibold text-[#111827] hover:underline"
                            type="button"
                            @click="openDetail('Notas', c.notes || '')"
                          >
                            Ver más…
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="customers.length === 0">
                      <td colspan="5" class="px-4 py-10 text-center text-[13px] text-gray-500">
                        No hay clientes para mostrar.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ===== MÓVIL REAL: CARDS (solo < sm) ===== -->
            <div class="sm:hidden space-y-3">
              <div
                v-for="c in customers"
                :key="c.id"
                class="rounded-2xl bg-white ring-1 ring-black/10 p-4"
              >
                <p class="text-[14px] font-semibold text-[#111827]">{{ c.fullName }}</p>
                <p class="text-[13px] text-gray-600 mt-0.5">{{ c.phone }}</p>

                <div class="mt-3 space-y-2 text-[13px]">
                  <div>
                    <p class="text-gray-400">Correo</p>
                    <p class="text-gray-700">{{ c.email || '—' }}</p>
                  </div>

                  <div>
                    <p class="text-gray-400">Dirección</p>
                    <div class="flex items-center gap-2">
                      <p class="text-gray-700">{{ shortText(formatAddress(c), 70) }}</p>
                      <button
                        v-if="formatAddress(c) !== '—' && formatAddress(c).length > 70"
                        class="text-[12px] font-semibold text-[#111827] hover:underline"
                        type="button"
                        @click="openDetail('Dirección', formatAddress(c))"
                      >
                        Ver más…
                      </button>
                    </div>
                  </div>

                  <div>
                    <p class="text-gray-400">Notas</p>
                    <div class="flex items-center gap-2">
                      <p class="text-gray-700">{{ shortText(c.notes, 90) }}</p>
                      <button
                        v-if="(c.notes || '').length > 90"
                        class="text-[12px] font-semibold text-[#111827] hover:underline"
                        type="button"
                        @click="openDetail('Notas', c.notes || '')"
                      >
                        Ver más…
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="customers.length === 0"
                class="rounded-2xl bg-white ring-1 ring-black/10 p-6 text-center text-[13px] text-gray-500"
              >
                No hay clientes para mostrar.
              </div>
            </div>

            <!-- Footer: paginación -->
            <div class="mt-4 flex items-center justify-between">
              <p class="text-[12px] text-gray-500">
                Mostrando {{ showingFrom }}–{{ showingTo }} de {{ pagination.total }} · Página {{ pagination.currentPage }} de {{ pagination.totalPages }}
              </p>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="h-9 rounded-xl px-4 text-[13px] font-semibold bg-[#E9EAED] text-[#111827] hover:bg-[#DDE0E6] transition disabled:opacity-60"
                  :disabled="!canPrev"
                  @click="prevPage"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  class="h-9 rounded-xl px-4 text-[13px] font-semibold bg-[#111827] text-white hover:bg-black transition disabled:opacity-60"
                  :disabled="!canNext"
                  @click="nextPage"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-model="detailOpen"
      :title="detailTitle"
      :message="detailText"
      @confirm="detailOpen = false"
    />

    <CatalogEditModal
      v-model="createOpen"
      mode="create"
      :model="createModel"
      title="Agregar cliente"
      @save="onCreateSave"
    />
  </section>
</template>