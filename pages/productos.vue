<template>
  <!-- ===== HERO ===== -->
  <section
    class="relative overflow-hidden pt-28 pb-16 px-5 text-center"
    style="background: radial-gradient(ellipse at 65% 0%, #fce8f0 0%, #f9d5e6 45%, #f2b3d0 100%)"
  >
    <img src="/svg/flower-tl.svg" alt="" class="pointer-events-none absolute top-0 right-0 w-48 opacity-20 scale-x-[-1]" />
    <img src="/svg/flower-br.svg" alt="" class="pointer-events-none absolute bottom-0 left-0 w-40 opacity-15 rotate-180" />
    <h1 class="relative font-serif text-4xl sm:text-5xl text-[#1E1E1E]">Conoce nuestros productos</h1>

    <!-- Buscador -->
    <div class="relative mx-auto mt-6 w-full max-w-md">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar producto..."
        class="w-full rounded-full bg-white/80 backdrop-blur-sm px-5 py-2.5 pr-10 text-sm text-[#1E1E1E] placeholder-[#1E1E1E]/40 shadow-sm outline-none ring-1 ring-[#F48AC1]/40 focus:ring-[#F48AC1] transition"
      />
      <!-- Clear button -->
      <button
        v-if="searchQuery"
        @click="searchQuery = ''"
        class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#1E1E1E]/40 hover:text-[#1E1E1E]/70 transition"
        aria-label="Limpiar búsqueda"
      >
        <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 8.586L4.707 3.293 3.293 4.707 8.586 10l-5.293 5.293 1.414 1.414L10 11.414l5.293 5.293 1.414-1.414L11.414 10l5.293-5.293-1.414-1.414L10 8.586z" clip-rule="evenodd"/></svg>
      </button>
      <!-- Search icon (when empty) -->
      <svg v-else class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1E1E1E]/35" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM8 14A6 6 0 108 2a6 6 0 000 12z" clip-rule="evenodd"/></svg>
    </div>
  </section>

  <!-- ===== LISTA DE PRODUCTOS ===== -->

  <!-- Initial loading skeleton -->
  <div v-if="initialLoading">
    <div v-for="n in 4" :key="n" class="animate-pulse" :class="n % 2 === 0 ? 'bg-white' : 'bg-[#FDE8F2]'">
      <div class="mx-auto max-w-4xl px-6 py-6 flex gap-6 items-center">
        <div class="flex-shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-black/10"></div>
        <div class="flex-1 space-y-3">
          <div class="h-3 w-1/4 rounded-full bg-black/10"></div>
          <div class="h-5 w-1/2 rounded bg-black/10"></div>
          <div class="h-3 w-full rounded bg-black/10"></div>
          <div class="h-3 w-4/5 rounded bg-black/10"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Products list -->
  <template v-else>
    <div
      v-for="(product, index) in products"
      :key="product.id"
      :class="index % 2 === 0 ? 'bg-[#FDE8F2]' : 'bg-white'"
    >
      <div
        class="mx-auto max-w-4xl px-6 py-6 flex flex-row gap-6 items-center"
        :class="index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'"
      >
        <!-- Image -->
        <div class="flex-shrink-0 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-gradient-to-br from-[#F7C0DB] to-[#F48AC1] shadow-sm">
          <img
            v-if="productImg(product)"
            :src="productImg(product)!"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-4xl">🎂</div>
        </div>

        <!-- Text -->
        <div class="flex-1 min-w-0 flex flex-col gap-2">
          <span
            class="inline-block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            :class="index % 2 === 0 ? 'bg-white/70 text-[#1E1E1E]/50' : 'bg-[#FDE8F2] text-[#1E1E1E]/50'"
          >
            {{ product.category?.name ? capitalize(product.category.name) : 'Producto' }}
          </span>
          <h2 class="font-serif text-xl sm:text-2xl text-[#1E1E1E] leading-snug">{{ capitalize(product.name) }}</h2>
          <p v-if="product.description" class="text-[#1E1E1E]/60 text-sm leading-relaxed line-clamp-3">
            {{ product.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Sin productos -->
    <div v-if="products.length === 0" class="py-24 text-center">
      <p class="text-[#1E1E1E]/40 text-sm">
        <template v-if="searchQuery">No se encontraron productos para “{{ searchQuery }}”</template>
        <template v-else>No hay productos disponibles por el momento.</template>
      </p>
    </div>

    <!-- Botón cargar más -->
    <div class="flex flex-col items-center gap-3 py-8 bg-white">
      <p class="text-[#1E1E1E]/40 text-xs">Mostrando {{ products.length }} producto{{ products.length !== 1 ? 's' : '' }}</p>
      <template v-if="hasMore">
        <button
          @click="loadMore"
          :disabled="loadingMore"
          class="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#1E1E1E] text-white text-sm font-medium hover:bg-[#1E1E1E]/80 disabled:opacity-50 transition-all"
        >
          <svg v-if="loadingMore" class="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <span>{{ loadingMore ? 'Cargando...' : 'Cargar más' }}</span>
        </button>
      </template>
      <p v-else-if="products.length > 0" class="text-[#1E1E1E]/35 text-xs">Eso es todo — has visto todos los productos</p>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { ProductItem } from '~/services/products.service'

definePageMeta({ layout: 'landing' })
useHead({ title: 'Productos · Magnolias' })

const apiBase = (useRuntimeConfig().public.apiBase as string).replace(/\/$/, '')
const LIMIT = 10

const products = ref<ProductItem[]>([])
const offset = ref(0)
const hasMore = ref(true)
const initialLoading = ref(true)
const loadingMore = ref(false)
const searchQuery = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

async function fetchProducts(reset = false) {
  if (reset) {
    products.value = []
    offset.value = 0
    hasMore.value = true
  }
  const params = new URLSearchParams({
    limit: String(LIMIT),
    offset: String(offset.value),
  })
  if (searchQuery.value.trim()) params.set('name', searchQuery.value.trim())

  const result = await $fetch<{ items: ProductItem[] }>(
    `${apiBase}/api/products?${params.toString()}`
  )
  const items = result?.items ?? []
  products.value.push(...items)
  offset.value += items.length
  hasMore.value = items.length === LIMIT
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  await fetchProducts()
  loadingMore.value = false
}

watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    initialLoading.value = true
    await fetchProducts(true)
    initialLoading.value = false
  }, 350)
})

onMounted(async () => {
  await fetchProducts()
  initialLoading.value = false
})

function productImg(p: ProductItem) {
  const active = p?.pictures?.find(pic => pic.isActive !== false)
  const url = active?.imageUrl
  return url ? String(url).trim() : null
}

function capitalize(str: string) {
  return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}
</script>

<style scoped>
h1, h2 {
  font-family: Georgia, 'Times New Roman', serif;
}
</style>

