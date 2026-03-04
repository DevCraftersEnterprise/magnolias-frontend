<template>
  <div class="px-6 py-6">
    <!-- Header central -->
    <div class="flex items-start justify-between gap-4">
      <div>
      </div>

      <button
        class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#101541]
               shadow-sm ring-1 ring-black/5 hover:shadow transition"
        @click="openCreateCategory()"
      >
        Agregar categoría
      </button>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div class="animate-pulse space-y-3">
        <div class="h-5 w-40 rounded bg-black/10"></div>
        <div class="h-3 w-72 rounded bg-black/10"></div>
        <div class="h-24 w-full rounded bg-black/10"></div>
      </div>
    </div>

    <div v-else-if="errorMsg" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <!-- Categorías -->
    <div v-else class="mt-6 space-y-6">
      <div
        v-for="cat in categoriesOrdered"
        :key="cat.id"
        class="select-none"
      >
        <!-- Título categoría -->
        <div class="flex items-center justify-between gap-3">
          <button
            class="group inline-flex items-center gap-3 text-left"
            @click="toggleCategory(cat.id)"
          >
            <span
              class="grid h-7 w-7 place-content-center rounded-lg bg-white shadow-sm ring-1 ring-black/5"
            >
              <svg
                class="h-4 w-4 transition-transform"
                :class="isCategoryOpen(cat.id) ? 'rotate-180' : 'rotate-0'"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>

            <h2 class="text-2xl font-semibold text-[#101541]">
              {{ cat.name }}
            </h2>
          </button>

          <!-- + Agregar producto -->
          <button
            class="grid h-9 w-9 place-content-center rounded-xl bg-white shadow-sm ring-1 ring-black/5
                   hover:shadow transition"
            @click="openCreateProduct(cat)"
            title="Agregar producto"
          >
            <svg class="h-5 w-5 text-[#101541]" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Contenedor cards -->
        <div v-show="isCategoryOpen(cat.id)" class="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div v-if="cat.items.length === 0" class="py-10 text-center text-sm text-black/50">
            No hay productos en esta categoría.
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <div
              v-for="p in cat.items"
              :key="p.id"
              class="group relative"
            >
              <!-- Card -->
              <div
                class="relative overflow-hidden rounded-2xl bg-[#F5D3E6] shadow-sm ring-1 ring-black/5"
              >
                <!-- Imagen / Placeholder -->
                <div class="relative aspect-[4/3]">
                  <img
                    v-if="productImg(p)"
                    :src="productImg(p)!"
                    class="h-full w-full object-cover"
                    :alt="p.name"
                    />
                  <div
                    v-else
                    class="h-full w-full bg-gradient-to-br from-[#F7C0DB] via-[#F6A5CE] to-[#F48AC1]"
                  />

                  <!-- Overlay hover -->
                  <div
                    class="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition flex items-center justify-center"
                  >
                    <button
                      class="opacity-0 group-hover:opacity-100 transition
                             rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-[#101541]
                             shadow-sm"
                      @click="openDetails(p)"
                    >
                      Ver detalles
                    </button>
                  </div>

                  <!-- Heart favorito -->
                  <button
                    class="absolute right-3 top-3 grid h-9 w-9 place-content-center rounded-xl bg-white/90
                           shadow-sm ring-1 ring-black/5 hover:bg-white transition"
                    @click.stop="toggleFavorite(p)"
                    :title="p.isFavorite ? 'Favorito' : 'Marcar como favorito'"
                  >
                    <svg
                      class="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M20.3 5.6c-1.4-1.5-3.6-1.5-5 0l-.6.6-.7-.6c-1.4-1.5-3.6-1.5-5 0-1.6 1.6-1.6 4.1 0 5.7l5.7 5.7 5.6-5.7c1.6-1.6 1.6-4.1 0-5.7Z"
                        :fill="p.isFavorite ? '#F472B6' : 'transparent'"
                        :stroke="p.isFavorite ? '#F472B6' : '#101541'"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>

                  <!-- Badge (opcional) -->
                  <span
                    v-if="p.isFavorite"
                    class="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#101541]
                           ring-1 ring-black/5"
                  >
                    Favorito
                  </span>
                </div>
              </div>

              <!-- Nombre -->
              <div class="mt-2">
                <p class="text-sm font-semibold text-[#101541]">
                  {{ p.name }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin categorías -->
      <div v-if="categoriesOrdered.length === 0" class="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <p class="text-sm text-black/60">No hay productos aún.</p>
      </div>
    </div>

    <!-- Modal placeholder: Crear categoría -->
    <div v-if="modalCategory.open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeCategoryModal()"></div>
      <div class="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div class="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/10">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-[#101541]">Agregar categoría</h3>
              <p class="mt-1 text-xs text-black/50">Luego conectamos el POST real.</p>
            </div>
            <button class="grid h-9 w-9 place-content-center rounded-xl hover:bg-black/5" @click="closeCategoryModal()">
              ✕
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <div>
              <label class="text-xs font-semibold text-black/60">Nombre</label>
              <input
                v-model="modalCategory.name"
                class="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-pink-300"
                placeholder="Ej: Pasteles"
              />
            </div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button class="h-10 rounded-xl px-4 text-sm font-semibold text-[#101541] hover:bg-black/5" @click="closeCategoryModal()">
              Cancelar
            </button>
            <button
              class="h-10 rounded-xl bg-[#F472B6] px-4 text-sm font-semibold text-white hover:brightness-95"
              @click="saveCategoryStub()"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal placeholder: Crear producto -->
    <div v-if="modalProduct.open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeProductModal()"></div>
      <div class="absolute left-1/2 top-1/2 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2">
        <div class="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/10">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-[#101541]">Agregar producto</h3>
              <p class="mt-1 text-xs text-black/50">
                Categoría: <span class="font-semibold text-[#101541]">{{ modalProduct.categoryName }}</span>
              </p>
            </div>
            <button class="grid h-9 w-9 place-content-center rounded-xl hover:bg-black/5" @click="closeProductModal()">
              ✕
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <div>
              <label class="text-xs font-semibold text-black/60">Nombre</label>
              <input
                v-model="modalProduct.name"
                class="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-pink-300"
                placeholder="Ej: Pastel 3 leches"
              />
            </div>

            <div>
              <label class="text-xs font-semibold text-black/60">Descripción</label>
              <textarea
                v-model="modalProduct.description"
                rows="3"
                class="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-pink-300"
                placeholder="Descripción corta..."
              />
            </div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button class="h-10 rounded-xl px-4 text-sm font-semibold text-[#101541] hover:bg-black/5" @click="closeProductModal()">
              Cancelar
            </button>
            <button
              class="h-10 rounded-xl bg-[#F472B6] px-4 text-sm font-semibold text-white hover:brightness-95"
              @click="saveProductStub()"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal placeholder: Detalles -->
    <div v-if="modalDetails.open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/40" @click="closeDetailsModal()"></div>
      <div class="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2">
        <div class="rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/10">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-[#101541]">Detalles</h3>
              <p class="mt-1 text-xs text-black/50">Este modal luego lo usamos para editar.</p>
            </div>
            <button class="grid h-9 w-9 place-content-center rounded-xl hover:bg-black/5" @click="closeDetailsModal()">
              ✕
            </button>
          </div>

          <div class="mt-4">
            <p class="text-sm font-semibold text-[#101541]">{{ modalDetails.product?.name }}</p>
            <p class="mt-1 text-sm text-black/60">{{ modalDetails.product?.description }}</p>
            <p class="mt-3 text-xs text-black/45">
              Categoría: <span class="font-semibold text-black/70">{{ modalDetails.product?.category?.name }}</span>
            </p>
          </div>

          <div class="mt-5 flex justify-end">
            <button class="h-10 rounded-xl bg-[#101541] px-4 text-sm font-semibold text-white hover:brightness-110" @click="closeDetailsModal()">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Productos · Magnolias' })

import { computed, onMounted, ref } from 'vue'
import { apiFetch } from '~/services/api.client'

/** =========================
 * Types
 * ========================= */
type CategoryMini = { id: string; name: string }

type ProductPicture = { imageUrl: string }

type ProductItem = {
  id: string
  name: string
  description: string
  isFavorite: boolean
  isActive: boolean
  category: CategoryMini
  createdAt: string
  updatedAt: string
  pictures: ProductPicture[]
}

type ProductsResponse = {
  items: ProductItem[]
  total: number
  pagination: { limit: number; offset: number; totalPages: number; currentPage: number }
}

type CategoryGroup = {
  id: string
  name: string
  items: ProductItem[]
}

/** =========================
 * State
 * ========================= */
const loading = ref(true)
const errorMsg = ref('')

const products = ref<ProductItem[]>([])
const openCategoryIds = ref<Set<string>>(new Set())

/** =========================
 * Helpers
 * ========================= */
function productImg(p: ProductItem) {
  const url = p?.pictures?.[0]?.imageUrl
  return url ? String(url).trim() : null
}

/** =========================
 * Fetch
 * ========================= */
function withPagination(base: string, limit: number, offset: number) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  return `${base}?${params.toString()}`
}

async function fetchAllProducts() {
  const limit = 50
  let offset = 0
  let out: ProductItem[] = []
  let total = 0

  while (true) {
    const url = withPagination('/api/products', limit, offset)
    const res = await apiFetch<ProductsResponse>(url, { method: 'GET', auth: true })
    out = out.concat(res.items)
    total = res.total

    offset += limit
    if (out.length >= total) break
    if (res.items.length === 0) break
  }

  products.value = out
}

/** =========================
 * Grouping
 * ========================= */
const categories = computed<CategoryGroup[]>(() => {
  const map = new Map<string, CategoryGroup>()

  for (const p of products.value) {
    const id = p.category?.id ?? 'no-cat'
    const name = p.category?.name ?? 'Sin categoría'
    if (!map.has(id)) map.set(id, { id, name, items: [] })
    map.get(id)!.items.push(p)
  }

  for (const g of map.values()) {
    g.items.sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }

  return Array.from(map.values())
})

const categoriesOrdered = computed(() => {
  return [...categories.value].sort((a, b) => a.name.localeCompare(b.name, 'es'))
})

/** =========================
 * UI: collapse categories
 * ========================= */
function isCategoryOpen(id: string) {
  return openCategoryIds.value.has(id)
}
function toggleCategory(id: string) {
  const s = new Set(openCategoryIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  openCategoryIds.value = s
}

/** =========================
 * Favorite (solo 1)
 * ========================= */
async function toggleFavorite(p: ProductItem) {
  const currentFav = products.value.find(x => x.isFavorite)

  if (currentFav && currentFav.id !== p.id) currentFav.isFavorite = false
  p.isFavorite = !p.isFavorite

  try {
    // await apiFetch(`/api/products/${p.id}`, { method: 'PATCH', auth: true, body: { isFavorite: p.isFavorite } })
  } catch (e: any) {
    if (currentFav && currentFav.id !== p.id) currentFav.isFavorite = true
    p.isFavorite = !p.isFavorite
  }
}

/** =========================
 * Modals (stubs)
 * ========================= */
const modalCategory = ref({
  open: false,
  name: '',
})

function openCreateCategory() {
  modalCategory.value.open = true
  modalCategory.value.name = ''
}
function closeCategoryModal() {
  modalCategory.value.open = false
}
async function saveCategoryStub() {
  closeCategoryModal()
}

const modalProduct = ref({
  open: false,
  categoryId: '',
  categoryName: '',
  name: '',
  description: '',
})

function openCreateProduct(cat: CategoryGroup) {
  modalProduct.value.open = true
  modalProduct.value.categoryId = cat.id
  modalProduct.value.categoryName = cat.name
  modalProduct.value.name = ''
  modalProduct.value.description = ''
}
function closeProductModal() {
  modalProduct.value.open = false
}
async function saveProductStub() {
  closeProductModal()
}

const modalDetails = ref<{ open: boolean; product: ProductItem | null }>({
  open: false,
  product: null,
})

function openDetails(p: ProductItem) {
  modalDetails.value.open = true
  modalDetails.value.product = p
}
function closeDetailsModal() {
  modalDetails.value.open = false
  modalDetails.value.product = null
}

/** =========================
 * Init
 * ========================= */
onMounted(async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await fetchAllProducts()

    const firstTwo = categoriesOrdered.value.slice(0, 2)
    openCategoryIds.value = new Set(firstTwo.map(x => x.id))
  } catch (e: any) {
    errorMsg.value = e?.message || 'No se pudieron cargar los productos.'
  } finally {
    loading.value = false
  }
})
</script>