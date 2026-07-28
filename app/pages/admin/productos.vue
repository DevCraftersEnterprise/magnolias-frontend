<script setup lang="ts">
definePageMeta({ layout: "admin", pageTitle: "Productos" });
useHead({ title: "Productos · Magnolias" });

import { categoriesService } from "~/services/categories.service";
import { productsService } from "~/services/products.service";
import type { CategoryItem, ProductItem } from "~/types/product.types";

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(true);
const errorMsg = ref("");

const categories = ref<CategoryItem[]>([]);
const openCategoryIds = ref<Set<string>>(new Set());

// ─── Helpers ────────────────────────────────────────────────────────────────
function productImg(p: ProductItem) {
  const activePicture = p?.pictures?.find((pic) => pic.isActive !== false);
  const url = activePicture?.imageUrl;
  return url ? String(url).trim() : null;
}

/** Posición vertical del badge "Oculto al público", según cuántos badges lo preceden */
function hiddenBadgeOffsetClass(p: ProductItem) {
  const badgesBefore = (p.isFavorite ? 1 : 0) + (!p.isActive ? 1 : 0);
  if (badgesBefore === 2) return "top-24";
  if (badgesBefore === 1) return "top-14";
  return "top-3";
}

// ─── Fetch ──────────────────────────────────────────────────────────────────
async function fetchAllProducts() {
  const data = await categoriesService.getAll();
  categories.value = data;
}

const categoriesOrdered = computed(() => {
  return [...categories.value].sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
});

// ─── Category collapse ──────────────────────────────────────────────────────
function isCategoryOpen(id: string) {
  return openCategoryIds.value.has(id);
}
function toggleCategory(id: string) {
  const s = new Set(openCategoryIds.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  openCategoryIds.value = s;
}

// ─── Favorite ───────────────────────────────────────────────────────────────
function findCurrentFavorite(): ProductItem | undefined {
  for (const cat of categories.value) {
    const fav = cat.products.find((x) => x.isFavorite);
    if (fav) return fav;
  }
  return undefined;
}

async function toggleFavorite(p: ProductItem) {
  const prevFav = findCurrentFavorite();
  const nextIsFav = !p.isFavorite;

  // optimistic UI: actualiza inmediatamente los objetos reactivos dentro de las categorías
  if (nextIsFav) {
    // desmarca el favorito anterior (si existe y es distinto)
    if (prevFav && prevFav.id !== p.id) prevFav.isFavorite = false;
    p.isFavorite = true;
  } else {
    p.isFavorite = false;
  }

  try {
    // El backend desmarca el favorito anterior automáticamente, solo se necesita una llamada
    await productsService.setFavorite(p, nextIsFav);
  } catch (e) {
    // rollback
    if (nextIsFav) {
      p.isFavorite = false;
      if (prevFav && prevFav.id !== p.id) prevFav.isFavorite = true;
    } else {
      p.isFavorite = true;
    }
  }
}

// ─── Init ────────────────────────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    await fetchAllProducts();

    const firstTwo = categoriesOrdered.value.slice(0, 2);
    openCategoryIds.value = new Set(firstTwo.map((x) => x.id));
  } catch (e: any) {
    errorMsg.value = e?.message || "No se pudieron cargar los productos.";
  } finally {
    loading.value = false;
  }
});

// ─── Modals ─────────────────────────────────────────────────────────────────
const categoryModal = ref({
  open: false,
  mode: "create" as "create" | "edit",
  category: null as any,
});
const productModal = ref({
  open: false,
  mode: "create" as const,
  categoryId: "",
});
const picturesModal = ref({ open: false, product: null as ProductItem | null });

function openCreateCategory() {
  categoryModal.value = { open: true, mode: "create", category: null };
}

function openCreateProduct(cat: any) {
  productModal.value = { open: true, mode: "create", categoryId: cat.id };
}

function onProductCreated(p: ProductItem) {
  const cat = categories.value.find(
    (c) => c.id === productModal.value.categoryId,
  );
  if (cat) {
    cat.products.push(p);
    const s = new Set(openCategoryIds.value);
    s.add(cat.id);
    openCategoryIds.value = s;
  }
  picturesModal.value = { open: true, product: p };
}

const editModalOpen = ref(false);
const editProduct = ref<ProductItem | null>(null);

const categoryOptions = computed(() =>
  categoriesOrdered.value.map((c) => ({ id: c.id, name: c.name })),
);

// Key dinámica para forzar re-renderizado del modal cuando cambien las fotos
const editModalKey = computed(() => {
  if (!editProduct.value) return "";
  return `${editProduct.value.id}-${editProduct.value.pictures?.length || 0}`;
});

function openDetails(p: ProductItem) {
  editProduct.value = p;
  editModalOpen.value = true;
}

async function reloadAll() {
  const editProductId = editProduct.value?.id;
  await fetchAllProducts();

  if (editProductId && editModalOpen.value) {
    let updated: ProductItem | undefined;
    for (const cat of categories.value) {
      updated = cat.products.find((p) => p.id === editProductId);
      if (updated) break;
    }
    if (updated) {
      await nextTick();
      editProduct.value = updated;
    }
  }
}
</script>

<template>
  <div class="px-6 py-6">
    <!-- Sticky header (limpio) -->
    <div class="top-0 z-20 -mx-6 px-6 pt-2 pb-4">
      <div class="flex items-center justify-end gap-3">
        <button
          class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#101541] shadow-sm ring-1 ring-black/5 hover:shadow transition active:scale-[0.99]"
          @click="openCreateCategory()"
        >
          <span class="grid h-6 w-6 place-content-center rounded-lg bg-black/5">
            <svg class="h-4 w-4 text-[#101541]" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </span>
          Agregar categoría
        </button>
      </div>
    </div>

    <!-- Loading / Error -->
    <div
      v-if="loading"
      class="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <div class="animate-pulse space-y-3">
        <div class="h-5 w-44 rounded bg-black/10"></div>
        <div class="h-3 w-80 rounded bg-black/10"></div>
        <div class="h-28 w-full rounded bg-black/10"></div>
      </div>
    </div>

    <div
      v-else-if="errorMsg"
      class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ errorMsg }}
    </div>

    <!-- Categorías -->
    <div v-else class="mt-4 space-y-5">
      <div
        v-for="cat in categoriesOrdered"
        :key="cat.id"
        class="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden"
      >
        <!-- Category header -->
        <div class="px-4 sm:px-5 py-4">
          <div class="flex items-center justify-between gap-4">
            <!-- Left: Toggle + title (ALINEADO) -->
            <button
              class="group flex items-center gap-3 text-left"
              @click="toggleCategory(cat.id)"
            >
              <span
                class="grid h-9 w-9 place-content-center rounded-xl bg-black/5 group-hover:bg-black/10 transition"
              >
                <svg
                  class="h-5 w-5 text-[#101541] transition-transform"
                  :class="isCategoryOpen(cat.id) ? 'rotate-180' : 'rotate-0'"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>

              <div class="flex items-center gap-2">
                <h2
                  class="text-xl sm:text-2xl font-semibold text-[#101541] leading-none"
                >
                  {{ cat.name }}
                </h2>

                <span
                  class="rounded-full bg-black/5 px-2.5 py-1 text-xs font-semibold text-black/60 leading-none"
                >
                  {{ cat.products.length }}
                </span>
              </div>
            </button>

            <!-- Right: Agregar producto -->
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-[#101541] shadow-sm ring-1 ring-black/5 hover:shadow transition active:scale-[0.99]"
              @click="openCreateProduct(cat)"
              title="Agregar producto"
            >
              <span
                class="grid h-7 w-7 place-content-center rounded-lg bg-black/5"
              >
                <svg
                  class="h-4 w-4 text-[#101541]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              <span class="hidden sm:inline">Agregar producto</span>
              <span class="sm:hidden">+</span>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div
          v-show="isCategoryOpen(cat.id)"
          class="border-t border-black/5 px-4 sm:px-5 py-4"
        >
          <div
            v-if="cat.products.length === 0"
            class="py-10 text-center text-sm text-black/50"
          >
            No hay productos en esta categoría.
          </div>

          <div
            v-else
            class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            <div v-for="p in cat.products" :key="p.id" class="group">
              <!-- Card -->
              <div
                class="relative overflow-hidden rounded-2xl bg-[#F5D3E6] ring-1 ring-black/5 shadow-sm transition will-change-transform group-hover:-translate-y-0.5 group-hover:shadow-md"
              >
                <div class="relative aspect-[4/3]">
                  <img
                    v-if="productImg(p)"
                    :src="productImg(p)!"
                    class="h-full w-full object-cover transition-all"
                    :class="{ 'grayscale opacity-60': !p.isActive }"
                    :alt="capitalize(p.name)"
                  />
                  <div
                    v-else
                    class="h-full w-full bg-gradient-to-br from-[#F7C0DB] via-[#F6A5CE] to-[#F48AC1] transition-all"
                    :class="{ 'grayscale opacity-60': !p.isActive }"
                  />

                  <!-- Overlay: NO captura clicks -->
                  <div
                    class="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition"
                  ></div>

                  <!-- Heart: arriba derecha, clickeable, centrado -->
                  <button
                    class="absolute right-3 top-3 z-10 h-10 w-10 rounded-xl bg-white/90 shadow-sm ring-1 ring-black/5 hover:bg-white transition flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    @click.stop="toggleFavorite(p)"
                    :disabled="p.isPublic === false"
                    :title="
                      p.isPublic === false
                        ? 'No se puede marcar como favorito un producto oculto al público'
                        : p.isFavorite
                          ? 'Favorito'
                          : 'Marcar como favorito'
                    "
                  >
                    <svg
                      class="h-5 w-5 -translate-x-0.5"
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

                  <!-- Badge favorito -->
                  <span
                    v-if="p.isFavorite"
                    class="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#101541] ring-1 ring-black/5"
                  >
                    Favorito
                  </span>

                  <!-- Badge No Disponible -->
                  <span
                    v-if="!p.isActive"
                    class="absolute left-3 z-10 rounded-full bg-gray-900/90 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-black/10 backdrop-blur-sm"
                    :class="p.isFavorite ? 'top-14' : 'top-3'"
                  >
                    No Disponible
                  </span>

                  <!-- Badge Oculto al público -->
                  <span
                    v-if="p.isPublic === false"
                    class="absolute left-3 z-10 rounded-full bg-[#101541]/90 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-black/10 backdrop-blur-sm"
                    :class="hiddenBadgeOffsetClass(p)"
                  >
                    Oculto al público
                  </span>

                  <!-- Ver detalles -->
                  <div
                    class="absolute inset-x-3 bottom-3 z-10 flex items-center justify-start opacity-0 group-hover:opacity-100 transition"
                  >
                    <button
                      class="rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-[#101541] shadow-sm ring-1 ring-black/5 hover:bg-white transition"
                      @click.stop="openDetails(p)"
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              </div>

              <!-- Name + description -->
              <div class="mt-3">
                <p
                  class="text-[13px] font-semibold text-[#101541] leading-snug line-clamp-1"
                >
                  {{ capitalize(p.name) }}
                </p>
                <p
                  v-if="p.description"
                  class="mt-0.5 text-xs text-black/50 leading-snug line-clamp-2"
                >
                  {{ p.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sin categorías -->
      <div
        v-if="categoriesOrdered.length === 0"
        class="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5"
      >
        <p class="text-sm text-black/60">No hay productos aún.</p>
      </div>
    </div>
  </div>

  <CategoryCreateModal
    v-if="categoryModal.open"
    :open="categoryModal.open"
    :mode="categoryModal.mode"
    :category="categoryModal.category"
    @close="categoryModal.open = false"
    @saved="reloadAll()"
  />

  <ProductCreateModal
    v-if="productModal.open"
    :open="productModal.open"
    :mode="productModal.mode"
    :categoryId="productModal.categoryId"
    @close="productModal.open = false"
    @created="onProductCreated"
  />

  <ProductLoadPicturesModal
    v-if="picturesModal.open && picturesModal.product"
    :open="picturesModal.open"
    :product="picturesModal.product"
    @close="picturesModal.open = false"
    @uploaded="reloadAll()"
  />

  <ProductEditModal
    v-if="editModalOpen && editProduct"
    :key="editModalKey"
    v-model="editModalOpen"
    :product="editProduct"
    :categories="categoryOptions"
    @updated="reloadAll()"
  />
</template>
