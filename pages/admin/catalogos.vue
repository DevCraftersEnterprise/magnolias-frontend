<script setup lang="ts">
definePageMeta({ layout: 'admin' })

import { onMounted, ref } from 'vue'
import { catalogsService, type ColorItem, type BreadTypeItem, type FillingItem, type FlavorItem, type FrostingItem, type StyleItem, type FlowerItem } from '~/services/catalogs.service'

type BlockKey = 'pan' | 'relleno' | 'sabor' | 'flor' | 'estilo' | 'color' | 'cubierta'

/** ====== Colores (API real) ====== */
const colorsLoading = ref(true)
const colors = ref<ColorItem[]>([])

async function loadColors() {
  colorsLoading.value = true
  try {
    const data = await catalogsService.getColors()
    colors.value = (data ?? []).filter(x => x.isActive)
  } finally {
    colorsLoading.value = false
  }
}

/** ====== Tipos de pan (API real) ====== */
const panesLoading = ref(true);
const panes = ref<BreadTypeItem[]>([]);

async function loadBreadTypes() {
  panesLoading.value = true;
  try {
    const data = await catalogsService.getBreadTypes();
    panes.value = (data.items ?? []).filter(x => x.isActive);
  } finally {
    panesLoading.value = false;
  }
}

/** ====== Rellenos (API real) ====== */
const fillingsLoading = ref(false);
const fillings = ref<FillingItem[]>([]);
const fillingsPagination = ref({
  limit: 10,
  offset: 0,
  totalPages: 1,
  currentPage: 1,
});

async function loadFillings() {
  fillingsLoading.value = true;
  try {
    const data = await catalogsService.getFillings(fillingsPagination.value.limit, fillingsPagination.value.offset);
    fillings.value = [...fillings.value, ...data.items];
    fillingsPagination.value = {
      ...fillingsPagination.value,
      totalPages: data.pagination.totalPages,
      currentPage: data.pagination.currentPage,
    };
  } finally {
    fillingsLoading.value = false;
  }
}

function loadMoreFillings() {
  if (fillingsPagination.value.currentPage < fillingsPagination.value.totalPages) {
    fillingsPagination.value.offset += fillingsPagination.value.limit;
    loadFillings();
  }
}

/** ====== Sabores (API real) ====== */
const flavorsLoading = ref(false);
const flavors = ref<FlavorItem[]>([]);
const flavorsPagination = ref({
  limit: 10,
  offset: 0,
  totalPages: 1,
  currentPage: 1,
});

async function loadFlavors() {
  flavorsLoading.value = true;
  try {
    const data = await catalogsService.getFlavors(flavorsPagination.value.limit, flavorsPagination.value.offset);
    flavors.value = [...flavors.value, ...data.items];
    flavorsPagination.value = {
      ...flavorsPagination.value,
      totalPages: data.pagination.totalPages,
      currentPage: data.pagination.currentPage,
    };
  } finally {
    flavorsLoading.value = false;
  }
}

function loadMoreFlavors() {
  if (flavorsPagination.value.currentPage < flavorsPagination.value.totalPages) {
    flavorsPagination.value.offset += flavorsPagination.value.limit;
    loadFlavors();
  }
}

/** ====== Frostings (API real) ====== */
const frostingsLoading = ref(false);
const frostings = ref<FrostingItem[]>([]);
const frostingsPagination = ref({
  limit: 10,
  offset: 0,
  totalPages: 1,
  currentPage: 1,
});

async function loadFrostings() {
  frostingsLoading.value = true;
  try {
    const data = await catalogsService.getFrostings(frostingsPagination.value.limit, frostingsPagination.value.offset);
    frostings.value = [...frostings.value, ...data.items];
    frostingsPagination.value = {
      ...frostingsPagination.value,
      totalPages: data.pagination.totalPages,
      currentPage: data.pagination.currentPage,
    };
  } finally {
    frostingsLoading.value = false;
  }
}

function loadMoreFrostings() {
  if (frostingsPagination.value.currentPage < frostingsPagination.value.totalPages) {
    frostingsPagination.value.offset += frostingsPagination.value.limit;
    loadFrostings();
  }
}

/** ====== Styles (API real) ====== */
const stylesLoading = ref(false);
const styles = ref<StyleItem[]>([]);
const stylesPagination = ref({
  limit: 10,
  offset: 0,
  totalPages: 1,
  currentPage: 1,
});

async function loadStyles() {
  stylesLoading.value = true;
  try {
    const data = await catalogsService.getStyles(stylesPagination.value.limit, stylesPagination.value.offset);
    styles.value = [...styles.value, ...data.items];
    stylesPagination.value = {
      ...stylesPagination.value,
      totalPages: data.pagination.totalPages,
      currentPage: data.pagination.currentPage,
    };
  } finally {
    stylesLoading.value = false;
  }
}

function loadMoreStyles() {
  if (stylesPagination.value.currentPage < stylesPagination.value.totalPages) {
    stylesPagination.value.offset += stylesPagination.value.limit;
    loadStyles();
  }
}

/** ====== Flowers (API real) ====== */
const flowersLoading = ref(false);
const flowers = ref<FlowerItem[]>([]);
const flowersPagination = ref({
  limit: 10,
  offset: 0,
  totalPages: 1,
  currentPage: 1,
});

async function loadFlowers() {
  flowersLoading.value = true;
  try {
    const data = await catalogsService.getFlowers(flowersPagination.value.limit, flowersPagination.value.offset);
    flowers.value = [...flowers.value, ...data.items];
    flowersPagination.value = {
      ...flowersPagination.value,
      totalPages: data.pagination.totalPages,
      currentPage: data.pagination.currentPage,
    };
  } finally {
    flowersLoading.value = false;
  }
}

function loadMoreFlowers() {
  if (flowersPagination.value.currentPage < flowersPagination.value.totalPages) {
    flowersPagination.value.offset += flowersPagination.value.limit;
    loadFlowers();
  }
}

onMounted(() => {
  loadColors();
  loadBreadTypes();
  loadFillings();
  loadFlavors();
  loadFrostings();
  loadStyles();
  loadFlowers();
});

/** Catálogos dummy */
const rellenos = ref<BreadTypeItem[]>([]);
const sabores = ref<BreadTypeItem[]>([]);
const flores = ref<BreadTypeItem[]>([]);
const estilos = ref<BreadTypeItem[]>([]);
const cubiertas = ref<BreadTypeItem[]>([]);

// Actualización de los datos dummy para que sean consistentes con BreadTypeItem
rellenos.value = [
  { id: '1', name: 'Vainilla', description: 'Relleno de vainilla', isActive: true },
  { id: '2', name: 'Chocolate', description: 'Relleno de chocolate', isActive: true },
];

sabores.value = [
  { id: '3', name: 'Fresa', description: 'Sabor a fresa', isActive: true },
  { id: '4', name: 'Limón', description: 'Sabor a limón', isActive: true },
];

flores.value = [
  { id: '5', name: 'Rosa', description: 'Flor decorativa', isActive: true },
  { id: '6', name: 'Girasol', description: 'Flor decorativa', isActive: true },
];

estilos.value = [
  { id: '7', name: 'Rayas', description: 'Estilo con rayas', isActive: true },
  { id: '8', name: 'Lunares', description: 'Estilo con lunares', isActive: true },
];

cubiertas.value = [
  { id: '9', name: 'Fondant', description: 'Cubierta de fondant', isActive: true },
  { id: '10', name: 'Crema', description: 'Cubierta de crema', isActive: true },
];

/** Seleccionado (para el rosita) */
const selected = ref<Record<BlockKey, string | null>>({
  pan: null,
  relleno: null,
  sabor: null,
  flor: null,
  estilo: null,
  color: null,
  cubierta: null,
})

function pick(block: BlockKey, value: string) {
  selected.value[block] = value
}

/** Por ahora solo mostramos un alert para que VEAS que sí funciona */
function addItem(block: BlockKey) {
  alert(`Aquí se abriría el modal para agregar a: ${block}`)
}

function openMenu(block: BlockKey, value: string) {
  alert(`Menú de acciones para "${value}" en ${block}`)
}

/** Config para no repetir */
const cards = [
  { key: 'pan', title: 'Tipos de pan', items: panes },
  { key: 'relleno', title: 'Rellenos', items: fillings },
  { key: 'sabor', title: 'Sabores', items: flavors },
  { key: 'flor', title: 'Flores', items: flowers },
  { key: 'estilo', title: 'Estilos', items: styles },
  { key: 'color', title: 'Colores', items: null }, // especial
  { key: 'cubierta', title: 'Tipos de cubierta', items: frostings },
] as const;
</script>

<template>
  <!-- Fondo gris y contenedor centrado -->
  <section class="min-h-[calc(100vh-64px)] bg-[#F6F6F7] font-sans">
    <div class="mx-auto w-full max-w-[1220px] px-6 py-6 lg:px-10 lg:py-8">

      <!-- GRID: 1 / 2 / 3 / 4 columnas -->
      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <!-- Card -->
        <div
          v-for="card in cards"
          :key="card.key"
          class="flex flex-col rounded-2xl bg-white shadow-[0_10px_28px_rgba(16,24,40,0.10)] ring-1 ring-black/5 overflow-hidden"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-black/5 px-4 py-3"
          >
            <span class="text-[13px] font-semibold text-[#1F1F1F]">
              {{ card.title }}
            </span>

            <button
              type="button"
              class="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#1F1F1F]/70 transition hover:bg-black/5 hover:text-[#1F1F1F]"
              @click="addItem(card.key as BlockKey)"
              aria-label="Agregar"
            >
              <span class="text-[18px] leading-none">+</span>
            </button>
          </div>

          <!-- Body -->
          <div class="max-h-[260px] space-y-1 overflow-auto p-2">
            <!-- Todas menos colores -->
            <template v-if="card.key !== 'color'">
              <button
                v-for="it in (card.items?.value ?? [])"
                :key="it.id"
                type="button"
                class="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-[#2B2B2B] transition cursor-pointer"
                :class="selected[card.key as BlockKey] === it.name
                  ? 'bg-[#F8D7E6]'
                  : 'hover:bg-[#FCE4F2]'"
                @click="pick(card.key as BlockKey, it.name)"
              >
                <div class="flex flex-col">
                  <span class="truncate font-semibold">{{ it.name }}</span>
                  <span class="truncate text-[12px] text-[#6B7280]">{{ it.description }}</span>
                </div>

                <!-- botón ... -->
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-[#2B2B2B]/70 opacity-0 transition group-hover:opacity-100"
                  :class="selected[card.key as BlockKey] === it.name ? 'opacity-100' : ''"
                  @click.stop="openMenu(card.key as BlockKey, it.name)"
                >
                  …
                </span>
              </button>

              <div v-if="card.key === 'relleno' && fillingsPagination.currentPage < fillingsPagination.totalPages" class="text-center mt-2">
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7] focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]"
                  @click="loadMoreFillings"
                >
                  Cargar más
                </button>
              </div>

              <div v-if="card.key === 'sabor' && flavorsPagination.currentPage < flavorsPagination.totalPages" class="text-center mt-2">
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7] focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]"
                  @click="loadMoreFlavors"
                >
                  Cargar más
                </button>
              </div>

              <div v-if="card.key === 'cubierta' && frostingsPagination.currentPage < frostingsPagination.totalPages" class="text-center mt-2">
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7] focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]"
                  @click="loadMoreFrostings"
                >
                  Cargar más
                </button>
              </div>

              <div v-if="card.key === 'estilo' && stylesPagination.currentPage < stylesPagination.totalPages" class="text-center mt-2">
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7] focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]"
                  @click="loadMoreStyles"
                >
                  Cargar más
                </button>
              </div>

              <div v-if="card.key === 'flor' && flowersPagination.currentPage < flowersPagination.totalPages" class="text-center mt-2">
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7] focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]"
                  @click="loadMoreFlowers"
                >
                  Cargar más
                </button>
              </div>
            </template>

            <!-- Colores -->
            <template v-else>
              <div
                v-if="colorsLoading"
                class="px-3 py-2 text-[13px] text-[#6B7280]"
              >
                Cargando…
              </div>

              <button
                v-else
                v-for="c in colors"
                :key="c.id"
                type="button"
                class="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-[#2B2B2B] transition cursor-pointer"
                :class="selected.color === c.name
                  ? 'bg-[#F8D7E6]'
                  : 'hover:bg-[#FCE4F2]'"
                @click="pick('color', c.name)"
              >
                <span class="truncate">
                  {{ c.name }}
                </span>

                <span class="flex items-center gap-3 shrink-0">
                  <!-- swatch grande y visible -->
                  <span
                    class="h-5 w-5 rounded-md border border-black/10 shadow-sm"
                    :style="{ backgroundColor: c.value }"
                  />
                  <span class="text-[12px] font-medium text-[#4B5563]">
                    {{ c.value }}
                  </span>

                  <!-- botón ... -->
                  <span
                    class="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-[#2B2B2B]/70 opacity-0 transition group-hover:opacity-100"
                    :class="selected.color === c.name ? 'opacity-100' : ''"
                    @click.stop="openMenu('color', c.name)"
                  >
                    …
                  </span>
                </span>
              </button>
            </template>
          </div>
        </div>

        <!-- hueco para que en xl queden 4 arriba y 3 abajo -->
        <div class="hidden xl:block" />
      </div>
    </div>
  </section>
</template>