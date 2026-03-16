<template>
  <div class="px-6 py-6">
    <!-- Sticky header (limpio) -->
    <div class="top-0 z-20 -mx-6 px-6 pt-2 pb-4">
      <div class="flex items-center justify-end gap-3">
        <button class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#101541]
                 shadow-sm ring-1 ring-black/5 hover:shadow transition active:scale-[0.99]"
          @click="openCreateCategory()">
          <span class="grid h-6 w-6 place-content-center rounded-lg bg-black/5">
            <svg class="h-4 w-4 text-[#101541]" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </span>
          Agregar categoría
        </button>
      </div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <div class="animate-pulse space-y-3">
        <div class="h-5 w-44 rounded bg-black/10"></div>
        <div class="h-3 w-80 rounded bg-black/10"></div>
        <div class="h-28 w-full rounded bg-black/10"></div>
      </div>
    </div>

    <div v-else-if="errorMsg" class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {{ errorMsg }}
    </div>

    <!-- Categorías -->
    <div v-else class="mt-4 space-y-5">
      <div v-for="cat in categoriesOrdered" :key="cat.id"
        class="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
        <!-- Category header -->
        <div class="px-4 sm:px-5 py-4">
          <div class="flex items-center justify-between gap-4">
            <!-- Left: Toggle + title (ALINEADO) -->
            <button class="group flex items-center gap-3 text-left" @click="toggleCategory(cat.id)">
              <span class="grid h-9 w-9 place-content-center rounded-xl bg-black/5 group-hover:bg-black/10 transition">
                <svg class="h-5 w-5 text-[#101541] transition-transform"
                  :class="isCategoryOpen(cat.id) ? 'rotate-180' : 'rotate-0'" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </span>

              <div class="flex items-center gap-2">
                <h2 class="text-xl sm:text-2xl font-semibold text-[#101541] leading-none">
                  {{ cat.name }}
                </h2>

                <span class="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-black/60 leading-none">
                  {{ cat.items.length }}
                </span>
              </div>
            </button>

            <!-- Right: Agregar producto -->
            <button class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#101541]
                     shadow-sm ring-1 ring-black/5 hover:shadow transition active:scale-[0.99]"
              @click="openCreateProduct(cat)" title="Agregar producto">
              <span class="grid h-7 w-7 place-content-center rounded-lg bg-black/5">
                <svg class="h-4 w-4 text-[#101541]" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </span>
              <span class="hidden sm:inline">Agregar producto</span>
              <span class="sm:hidden">+</span>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div v-show="isCategoryOpen(cat.id)" class="border-t border-black/5 px-4 sm:px-5 py-4">
          <div v-if="cat.items.length === 0" class="py-10 text-center text-sm text-black/50">
            No hay productos en esta categoría.
          </div>

          <div v-else class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <div v-for="p in cat.items" :key="p.id" class="group">
              <!-- Card -->
              <div class="relative overflow-hidden rounded-2xl bg-[#F5D3E6] ring-1 ring-black/5 shadow-sm
                       transition will-change-transform group-hover:-translate-y-0.5 group-hover:shadow-md">
                <div class="relative aspect-[4/3]">
                  <img v-if="productImg(p)" :src="productImg(p)!" class="h-full w-full object-cover transition-all"
                    :class="{ 'grayscale opacity-60': !p.isActive }" :alt="capitalize(p.name)" />
                  <div v-else
                    class="h-full w-full bg-gradient-to-br from-[#F7C0DB] via-[#F6A5CE] to-[#F48AC1] transition-all"
                    :class="{ 'grayscale opacity-60': !p.isActive }" />

                  <!-- Overlay: NO captura clicks -->
                  <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/35 via-black/0 to-black/0
                           opacity-0 group-hover:opacity-100 transition"></div>

                  <!-- Heart: arriba derecha, clickeable, centrado -->
                  <button class="absolute right-3 top-3 z-10 h-10 w-10 rounded-xl bg-white/90
                           shadow-sm ring-1 ring-black/5 hover:bg-white transition
                           flex items-center justify-center" @click.stop="toggleFavorite(p)"
                    :title="p.isFavorite ? 'Favorito' : 'Marcar como favorito'">
                    <svg class="h-5 w-5 -translate-x-0.5" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20.3 5.6c-1.4-1.5-3.6-1.5-5 0l-.6.6-.7-.6c-1.4-1.5-3.6-1.5-5 0-1.6 1.6-1.6 4.1 0 5.7l5.7 5.7 5.6-5.7c1.6-1.6 1.6-4.1 0-5.7Z"
                        :fill="p.isFavorite ? '#F472B6' : 'transparent'" :stroke="p.isFavorite ? '#F472B6' : '#101541'"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>

                  <!-- Badge favorito -->
                  <span v-if="p.isFavorite" class="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#101541]
                           ring-1 ring-black/5">
                    Favorito
                  </span>

                  <!-- Badge No Disponible -->
                  <span v-if="!p.isActive" class="absolute left-3 z-10 rounded-full bg-gray-900/90 px-3 py-1 text-[11px] font-semibold text-white
                           ring-1 ring-black/10 backdrop-blur-sm" :class="p.isFavorite ? 'top-14' : 'top-3'">
                    No Disponible
                  </span>

                  <!-- Ver detalles -->
                  <div
                    class="absolute inset-x-3 bottom-3 z-10 flex items-center justify-start opacity-0 group-hover:opacity-100 transition">
                    <button class="rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-[#101541]
                            shadow-sm ring-1 ring-black/5 hover:bg-white transition" @click.stop="openDetails(p)">
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>

              <!-- Name + description -->
              <div class="mt-3">
                <p class="text-[13px] font-semibold text-[#101541] leading-snug line-clamp-1">
                  {{ capitalize(p.name) }}
                </p>
                <p v-if="p.description" class="mt-0.5 text-xs text-black/50 leading-snug line-clamp-2">
                  {{ p.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin categorías -->
      <div v-if="categoriesOrdered.length === 0"
        class="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <p class="text-sm text-black/60">No hay productos aún.</p>
      </div>
    </div>

    <!-- ===== MODALES ===== -->

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
              <input v-model="modalCategory.name"
                class="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-pink-300"
                placeholder="Ej: Pasteles" />
            </div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button class="h-10 rounded-xl px-4 text-sm font-semibold text-[#101541] hover:bg-black/5"
              @click="closeCategoryModal()">
              Cancelar
            </button>
            <button class="h-10 rounded-xl bg-[#F472B6] px-4 text-sm font-semibold text-white hover:brightness-95"
              @click="saveCategoryStub()">
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
              <input v-model="modalProduct.name"
                class="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-pink-300"
                placeholder="Ej: Pastel 3 leches" />
            </div>

            <div>
              <label class="text-xs font-semibold text-black/60">Descripción</label>
              <textarea v-model="modalProduct.description" rows="3"
                class="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-pink-300"
                placeholder="Descripción corta..." />
            </div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button class="h-10 rounded-xl px-4 text-sm font-semibold text-[#101541] hover:bg-black/5"
              @click="closeProductModal()">
              Cancelar
            </button>
            <button class="h-10 rounded-xl bg-[#F472B6] px-4 text-sm font-semibold text-white hover:brightness-95"
              @click="saveProductStub()">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
  <!-- ===== MODALES NUEVOS (componentes) ===== -->

  <CategoryModal v-if="categoryModal.open" :open="categoryModal.open" :mode="categoryModal.mode"
    :category="categoryModal.category" @close="categoryModal.open = false" @saved="reloadAll()" />

  <ProductModal v-if="productModal.open" :open="productModal.open" :mode="productModal.mode"
    :categoryId="productModal.categoryId" @close="productModal.open = false" @created="onProductCreated" />

  <ProductPicturesModal v-if="picturesModal.open && picturesModal.product" :open="picturesModal.open"
    :product="picturesModal.product" @close="picturesModal.open = false" @uploaded="reloadAll()" />
  <ProductEditModal v-if="editModalOpen && editProduct" :key="editModalKey" v-model="editModalOpen"
    :product="editProduct" :categories="categoryOptions" @updated="reloadAll()" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Productos · Magnolias' })

import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { apiFetch } from '~/services/api.client'

/** =========================
 * Types
 * ========================= */
type CategoryMini = { id: string; name: string }

type ProductPicture = {
  id: string
  imageUrl: string
  isActive: boolean
}

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
  // Obtener solo la primera imagen activa
  const activePicture = p?.pictures?.find(pic => pic.isActive !== false)
  const url = activePicture?.imageUrl
  return url ? String(url).trim() : null
}

function capitalize(str: string): string {
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
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
    const name = capitalize(p.category?.name ?? 'Sin categoría')
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
import { productsService } from '~/services/products.service'

async function toggleFavorite(p: ProductItem) {
  const prevFav = products.value.find(x => x.isFavorite)

  // estado objetivo
  const nextIsFav = !p.isFavorite

  // optimistic UI:
  if (nextIsFav) {
    // si vamos a marcar este como favorito, desmarca el anterior
    if (prevFav && prevFav.id !== p.id) prevFav.isFavorite = false
    p.isFavorite = true
  } else {
    // si lo vamos a desmarcar, queda ninguno
    p.isFavorite = false
  }

  // fuerza refresco visual
  products.value = [...products.value]

  try {
    // actualiza el clickeado
    await productsService.setFavorite(p, p.isFavorite)
  } catch (e) {
    // rollback
    if (nextIsFav) {
      // queríamos marcar p, volvemos al estado anterior
      p.isFavorite = false
      if (prevFav && prevFav.id !== p.id) prevFav.isFavorite = true
    } else {
      // queríamos desmarcar p, lo regresamos
      p.isFavorite = true
    }

    products.value = [...products.value]
  }
}

/** =========================
 * Modals (stubs)
 * ========================= */
const modalCategory = ref({
  open: false,
  name: '',
})

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



/// =========================
/// modales
import CategoryModal from '~/components/modals/CategoryModal.vue'
import ProductModal from '~/components/modals/ProductModal.vue'
import ProductPicturesModal from '~/components/modals/ProductPicturesModal.vue'
import ProductEditModal from '~/components/modals/ProductEditModal.vue'

// estados
const categoryModal = ref({ open: false, mode: 'create' as const, category: null as any })
const productModal = ref({ open: false, mode: 'create' as const, categoryId: '' })
const picturesModal = ref({ open: false, product: null as ProductItem | null })

function openCreateCategory() {
  categoryModal.value = { open: true, mode: 'create', category: null }
}

function openEditCategory(cat: any) {
  categoryModal.value = { open: true, mode: 'edit', category: cat }
}

function openCreateProduct(cat: any) {
  productModal.value = { open: true, mode: 'create', categoryId: cat.id }
}

// después de crear producto -> abrir modal de fotos
function onProductCreated(p: ProductItem) {
  picturesModal.value = { open: true, product: p }
}

// categories: si no tienes un GET de categorías aún, puedes construirlas desde productos agrupados
const editModalOpen = ref(false)
const editProduct = ref<ProductItem | null>(null)

const categoryOptions = computed(() =>
  categoriesOrdered.value.map(c => ({ id: c.id, name: c.name }))
)

// Key dinámica para forzar re-renderizado del modal cuando cambien las fotos
const editModalKey = computed(() => {
  if (!editProduct.value) return ''
  return `${editProduct.value.id}-${editProduct.value.pictures?.length || 0}`
})

function openDetails(p: ProductItem) {
  editProduct.value = p
  editModalOpen.value = true
}

function closeEditModal() {
  editModalOpen.value = false
  editProduct.value = null
}

// refrescar
async function reloadAll() {
  const editProductId = editProduct.value?.id
  await fetchAllProducts()

  // Si hay un producto en edición, actualizar su referencia con los datos frescos
  if (editProductId && editModalOpen.value) {
    const updated = products.value.find(p => p.id === editProductId)
    if (updated) {
      // Usar nextTick para asegurar que Vue actualice la UI
      await nextTick()
      editProduct.value = updated
    }
  }
}
</script>