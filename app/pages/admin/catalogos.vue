<!-- pages/admin/catalogos.vue -->
<script setup lang="ts">
definePageMeta({ layout: "admin", pageTitle: "Catálogos" });
useHead({ title: "Catálogos · Magnolias" });

import { onMounted, ref } from "vue";
import CatalogEditModal, {
  type CatalogEditPayload,
} from "~/components/modals/CatalogEditModal.vue";
import ConfirmModal from "~/components/ConfirmModal.vue";
import ColorEditModal, {
  type ColorEditPayload,
} from "~/components/modals/ColorEditModal.vue";
import { catalogsService } from "~/services/catalogs.service";
import type {
  BreadTypeItem,
  ColorItem,
  FillingItem,
  FlavorItem,
  FlowerItem,
  FrostingItem,
  StyleItem,
} from "~/types/catalog.types";

type BlockKey =
  | "pan"
  | "relleno"
  | "sabor"
  | "flor"
  | "estilo"
  | "color"
  | "cubierta";

const blockLabel: Record<BlockKey, string> = {
  pan: "tipo de pan",
  relleno: "relleno",
  sabor: "sabor",
  flor: "flor",
  estilo: "estilo",
  color: "color",
  cubierta: "tipo de cubierta",
};

const modalTitle = ref(""); // ✅ título dinámico

/** ====== Colores (API real) ====== */
const colorsLoading = ref(true);
const colors = ref<ColorItem[]>([]);
const colorOpen = ref(false);
const colorMode = ref<"create" | "edit">("create"); // si después quieres editar, ahorita solo create
const colorModel = ref<ColorEditPayload | null>(null);

async function loadColors() {
  colorsLoading.value = true;
  try {
    const data = await catalogsService.getColors();
    colors.value = (data ?? []).filter((x) => x.isActive);
  } finally {
    colorsLoading.value = false;
  }
}

/** ====== Tipos de pan (API real) ====== */
const panesLoading = ref(true);
const panes = ref<BreadTypeItem[]>([]);

async function loadBreadTypes() {
  panesLoading.value = true;
  try {
    const data = await catalogsService.getBreadTypes();
    panes.value = (data.items ?? []).filter((x) => x.isActive);
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
    const data = await catalogsService.getFillings(
      fillingsPagination.value.limit,
      fillingsPagination.value.offset,
    );

    // ✅ solo activos
    const activeItems = (data.items ?? []).filter((x) => x.isActive);
    fillings.value = [...fillings.value, ...activeItems];

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
  if (
    fillingsPagination.value.currentPage < fillingsPagination.value.totalPages
  ) {
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
    const data = await catalogsService.getFlavors(
      flavorsPagination.value.limit,
      flavorsPagination.value.offset,
    );

    // ✅ solo activos
    const activeItems = (data.items ?? []).filter((x) => x.isActive);
    flavors.value = [...flavors.value, ...activeItems];

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
  if (
    flavorsPagination.value.currentPage < flavorsPagination.value.totalPages
  ) {
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
    const data = await catalogsService.getFrostings(
      frostingsPagination.value.limit,
      frostingsPagination.value.offset,
    );
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
  if (
    frostingsPagination.value.currentPage < frostingsPagination.value.totalPages
  ) {
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
    const data = await catalogsService.getStyles(
      stylesPagination.value.limit,
      stylesPagination.value.offset,
    );
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
    const data = await catalogsService.getFlowers(
      flowersPagination.value.limit,
      flowersPagination.value.offset,
    );
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
  if (
    flowersPagination.value.currentPage < flowersPagination.value.totalPages
  ) {
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

/** Seleccionado (para el rosita) */
const selected = ref<Record<BlockKey, string | null>>({
  pan: null,
  relleno: null,
  sabor: null,
  flor: null,
  estilo: null,
  color: null,
  cubierta: null,
});

function pick(block: BlockKey, value: string) {
  selected.value[block] = value;
}

/** ===== UX actions (editar / eliminar) ===== */
type AnyItem = {
  id: string;
  name: string;
  description?: string;
  value?: string;
};

const editOpen = ref(false);
const editMode = ref<"create" | "edit">("create");
const editBlock = ref<BlockKey>("pan");
const editModel = ref<CatalogEditPayload | null>(null);

const confirmOpen = ref(false);
const confirmTitle = ref("¿Seguro?");
const confirmMessage = ref("");
const pendingAction = ref<null | (() => Promise<void> | void)>(null);

function openCreate(block: BlockKey) {
  // Color se maneja con su propio modal
  if (block === "color") {
    colorMode.value = "create";
    colorModel.value = { name: "", value: "#FFB6C1" };
    colorOpen.value = true;
    return;
  }

  modalTitle.value = `Agregar ${blockLabel[block]}`;
  editMode.value = "create";
  editBlock.value = block;
  editModel.value = { name: "", description: "" };
  editOpen.value = true;
}

function openEdit(block: BlockKey, item: AnyItem) {
  if (block === "color") return;

  modalTitle.value = `Editar ${blockLabel[block]}`;
  editMode.value = "edit";
  editBlock.value = block;
  editModel.value = {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
  };
  editOpen.value = true;
}

function openDelete(block: BlockKey, item: AnyItem) {
  confirmTitle.value = `¿Está seguro de querer desactivar el elemento ${item.name}?`;
  confirmMessage.value = "Esta acción desactivará el elemento del catálogo.";
  confirmOpen.value = true;

  pendingAction.value = async () => {
    const handlers: Record<BlockKey, () => Promise<void>> = {
      pan: async () => {
        await catalogsService.deleteBreadType(item.id);
        await loadBreadTypes();
        if (selected.value.pan === item.name) selected.value.pan = null;
      },

      relleno: async () => {
        await catalogsService.deleteFilling(item.id);
        fillings.value = [];
        fillingsPagination.value = {
          ...fillingsPagination.value,
          offset: 0,
          currentPage: 1,
        };
        await loadFillings();
        if (selected.value.relleno === item.name) selected.value.relleno = null;
      },

      sabor: async () => {
        await catalogsService.deleteFlavor(item.id);
        flavors.value = [];
        flavorsPagination.value = {
          ...flavorsPagination.value,
          offset: 0,
          currentPage: 1,
        };
        await loadFlavors();
        if (selected.value.sabor === item.name) selected.value.sabor = null;
      },

      cubierta: async () => {
        await catalogsService.deleteFrosting(item.id);
        frostings.value = [];
        frostingsPagination.value = {
          ...frostingsPagination.value,
          offset: 0,
          currentPage: 1,
        };
        await loadFrostings();
        if (selected.value.cubierta === item.name)
          selected.value.cubierta = null;
      },

      estilo: async () => {
        await catalogsService.deleteStyle(item.id);
        styles.value = [];
        stylesPagination.value = {
          ...stylesPagination.value,
          offset: 0,
          currentPage: 1,
        };
        await loadStyles();
        if (selected.value.estilo === item.name) selected.value.estilo = null;
      },

      flor: async () => {
        await catalogsService.deleteFlower(item.id);
        flowers.value = [];
        flowersPagination.value = {
          ...flowersPagination.value,
          offset: 0,
          currentPage: 1,
        };
        await loadFlowers();
        if (selected.value.flor === item.name) selected.value.flor = null;
      },

      color: async () => {
        // pendiente endpoint real de colores
        await loadColors();
        if (selected.value.color === item.name) selected.value.color = null;
      },
    };

    try {
      await handlers[block]();
    } catch (e) {
      console.error("Error eliminando:", { block, item, e });
    }
  };
}

async function onConfirmDelete() {
  confirmOpen.value = false;
  const fn = pendingAction.value;
  pendingAction.value = null;
  if (fn) await fn();
}

/** Guardar edit */
/** Guardar edit / create */
async function onSaveEdit(payload: CatalogEditPayload) {
  editOpen.value = false;

  const block = editBlock.value;
  const isEdit = editMode.value === "edit";

  // color usa su propio modal
  if (block === "color") return;

  // Helpers para refrescar listas paginadas
  const resetFillings = async () => {
    fillings.value = [];
    fillingsPagination.value = {
      ...fillingsPagination.value,
      offset: 0,
      currentPage: 1,
    };
    await loadFillings();
  };

  const resetFlavors = async () => {
    flavors.value = [];
    flavorsPagination.value = {
      ...flavorsPagination.value,
      offset: 0,
      currentPage: 1,
    };
    await loadFlavors();
  };

  const resetFrostings = async () => {
    frostings.value = [];
    frostingsPagination.value = {
      ...frostingsPagination.value,
      offset: 0,
      currentPage: 1,
    };
    await loadFrostings();
  };

  const resetStyles = async () => {
    styles.value = [];
    stylesPagination.value = {
      ...stylesPagination.value,
      offset: 0,
      currentPage: 1,
    };
    await loadStyles();
  };

  const resetFlowers = async () => {
    flowers.value = [];
    flowersPagination.value = {
      ...flowersPagination.value,
      offset: 0,
      currentPage: 1,
    };
    await loadFlowers();
  };

  // ===== CREATE (POST) =====
  if (!isEdit) {
    if (block === "pan") {
      await catalogsService.createBreadType({
        name: payload.name,
        description: payload.description ?? "",
      });
      await loadBreadTypes();
      return;
    }

    if (block === "relleno") {
      await catalogsService.createFilling({
        name: payload.name,
        description: payload.description ?? "",
      });
      await resetFillings();
      return;
    }

    if (block === "sabor") {
      await catalogsService.createFlavor({
        name: payload.name,
        description: payload.description ?? "",
      });
      await resetFlavors();
      return;
    }

    if (block === "cubierta") {
      await catalogsService.createFrosting({
        name: payload.name,
        description: payload.description ?? "",
      });
      await resetFrostings();
      return;
    }

    if (block === "estilo") {
      await catalogsService.createStyle({
        name: payload.name,
        description: payload.description ?? "",
      });
      await resetStyles();
      return;
    }

    if (block === "flor") {
      await catalogsService.createFlower({
        name: payload.name,
        description: payload.description ?? "",
      });
      await resetFlowers();
      return;
    }

    return;
  }

  // ===== EDIT (PATCH) =====
  if (block === "pan") {
    await catalogsService.patchBreadType(payload.id!, {
      name: payload.name,
      description: payload.description ?? "",
      isActive: true,
    });
    await loadBreadTypes();
    return;
  }

  if (block === "relleno") {
    await catalogsService.patchFilling(payload.id!, {
      name: payload.name,
      description: payload.description ?? "",
      isActive: true,
    });
    await resetFillings();
    return;
  }

  if (block === "sabor") {
    await catalogsService.patchFlavor(payload.id!, {
      name: payload.name,
      description: payload.description ?? "",
      isActive: true,
    });
    await resetFlavors();
    return;
  }

  if (block === "cubierta") {
    await catalogsService.patchFrosting(payload.id!, {
      name: payload.name,
      description: payload.description ?? "",
      isActive: true,
    });
    await resetFrostings();
    return;
  }

  if (block === "estilo") {
    await catalogsService.patchStyle(payload.id!, {
      name: payload.name,
      description: payload.description ?? "",
      isActive: true,
    });
    await resetStyles();
    return;
  }

  if (block === "flor") {
    await catalogsService.patchFlower(payload.id!, {
      name: payload.name,
      description: payload.description ?? "",
      isActive: true,
    });
    await resetFlowers();
    return;
  }
}
async function onSaveColor(payload: ColorEditPayload) {
  colorOpen.value = false;
  await catalogsService.createColor({
    name: payload.name,
    value: payload.value,
  });
  await loadColors();
}

/** Config para no repetir */
const cards = [
  { key: "pan", title: "Tipos de pan", items: panes },
  { key: "relleno", title: "Rellenos", items: fillings },
  { key: "sabor", title: "Sabores", items: flavors },
  { key: "flor", title: "Flores", items: flowers },
  { key: "estilo", title: "Estilos", items: styles },
  { key: "color", title: "Colores", items: null }, // especial
  { key: "cubierta", title: "Tipos de cubierta", items: frostings },
] as const;
</script>

<template>
  <section class="min-h-[calc(100vh-64px)] bg-[#F6F6F7] font-sans">
    <div class="mx-auto w-full max-w-[1220px] px-6 py-6 lg:px-10 lg:py-8">
      <div
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <div
          v-for="card in cards"
          :key="card.key"
          class="flex flex-col rounded-2xl bg-white shadow-[0_10px_28px_rgba(16,24,40,0.10)] ring-1 ring-black/5 overflow-hidden"
        >
          <div
            class="flex items-center justify-between border-b border-black/5 px-4 py-3"
          >
            <span class="text-[13px] font-semibold text-[#1F1F1F]">
              {{ card.title }}
            </span>

            <button
              type="button"
              class="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-[#1F1F1F]/70 transition hover:bg-black/5 hover:text-[#1F1F1F]"
              @click="openCreate(card.key as BlockKey)"
              aria-label="Agregar"
            >
              <span class="text-[18px] leading-none">+</span>
            </button>
          </div>

          <div class="max-h-[260px] space-y-1 overflow-auto p-2">
            <!-- Todas menos colores -->
            <template v-if="card.key !== 'color'">
              <div
                v-if="colorsLoading"
                class="px-3 py-2 text-[13px] text-[#6B7280]"
              >
                Cargando…
              </div>
              <button
                v-for="it in card.items?.value ?? []"
                :key="it.id"
                type="button"
                class="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-[#2B2B2B] transition cursor-pointer"
                :class="
                  selected[card.key as BlockKey] === it.name
                    ? 'bg-[#F8D7E6]'
                    : 'hover:bg-[#FCE4F2]'
                "
                @click="pick(card.key as BlockKey, it.name)"
              >
                <div class="flex flex-col min-w-0">
                  <span class="truncate font-semibold">{{ it.name }}</span>
                  <span class="truncate text-[12px] text-[#6B7280]">{{
                    it.description
                  }}</span>
                </div>

                <!-- Acciones (hover) -->
                <div class="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    class="grid h-7 w-7 place-items-center rounded-lg text-gray-500 opacity-0 group-hover:opacity-100 transition hover:bg-black/5 hover:text-gray-800"
                    :class="
                      selected[card.key as BlockKey] === it.name
                        ? 'opacity-100'
                        : ''
                    "
                    @click.stop="openEdit(card.key as BlockKey, it as any)"
                    aria-label="Editar"
                  >
                    <!-- Pencil -->
                    <svg
                      viewBox="0 0 24 24"
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M12 20h9" />
                      <path
                        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    class="grid h-7 w-7 place-items-center rounded-lg text-gray-500 opacity-0 group-hover:opacity-100 transition hover:bg-black/5 hover:text-red-600"
                    :class="
                      selected[card.key as BlockKey] === it.name
                        ? 'opacity-100'
                        : ''
                    "
                    @click.stop="openDelete(card.key as BlockKey, it as any)"
                    aria-label="Eliminar"
                  >
                    <!-- Trash -->
                    <svg
                      viewBox="0 0 24 24"
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                </div>
              </button>

              <div
                v-if="
                  card.key === 'relleno' &&
                  fillingsPagination.currentPage < fillingsPagination.totalPages
                "
                class="text-center mt-2"
              >
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7]"
                  @click="loadMoreFillings"
                >
                  Cargar más
                </button>
              </div>

              <div
                v-if="
                  card.key === 'sabor' &&
                  flavorsPagination.currentPage < flavorsPagination.totalPages
                "
                class="text-center mt-2"
              >
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7]"
                  @click="loadMoreFlavors"
                >
                  Cargar más
                </button>
              </div>

              <div
                v-if="
                  card.key === 'cubierta' &&
                  frostingsPagination.currentPage <
                    frostingsPagination.totalPages
                "
                class="text-center mt-2"
              >
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7]"
                  @click="loadMoreFrostings"
                >
                  Cargar más
                </button>
              </div>

              <div
                v-if="
                  card.key === 'estilo' &&
                  stylesPagination.currentPage < stylesPagination.totalPages
                "
                class="text-center mt-2"
              >
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7]"
                  @click="loadMoreStyles"
                >
                  Cargar más
                </button>
              </div>

              <div
                v-if="
                  card.key === 'flor' &&
                  flowersPagination.currentPage < flowersPagination.totalPages
                "
                class="text-center mt-2"
              >
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7]"
                  @click="loadMoreFlowers"
                >
                  Cargar más
                </button>
              </div>

              <div
                v-if="!colorsLoading && (card.items?.value ?? []).length === 0"
                class="flex flex-col items-center gap-1 py-6 text-center"
              >
                <span class="text-[12px] text-[#9CA3AF]"
                  >Sin elementos registrados</span
                >
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

              <div
                v-if="!colorsLoading && colors.length === 0"
                class="flex flex-col items-center gap-1 py-6 text-center"
              >
                <span class="text-[12px] text-[#9CA3AF]"
                  >Sin colores registrados</span
                >
              </div>

              <button
                v-else
                v-for="c in colors"
                :key="c.id"
                type="button"
                class="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[13px] text-[#2B2B2B] transition cursor-pointer"
                :class="
                  selected.color === c.name
                    ? 'bg-[#F8D7E6]'
                    : 'hover:bg-[#FCE4F2]'
                "
                @click="pick('color', c.name)"
              >
                <span class="truncate min-w-0">
                  {{ c.name }}
                </span>

                <span class="flex items-center gap-3 shrink-0">
                  <span
                    class="h-5 w-5 rounded-md border border-black/10 shadow-sm"
                    :style="{ backgroundColor: c.value }"
                  />
                  <span class="text-[12px] font-medium text-[#4B5563]">
                    {{ c.value }}
                  </span>

                  <!-- SOLO eliminar -->
                  <button
                    type="button"
                    class="grid h-7 w-7 place-items-center rounded-lg text-gray-500 opacity-0 group-hover:opacity-100 transition hover:bg-black/5 hover:text-red-600"
                    :class="selected.color === c.name ? 'opacity-100' : ''"
                    @click.stop="openDelete('color', c as any)"
                    aria-label="Eliminar"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                </span>
              </button>
            </template>
          </div>
        </div>

        <div class="hidden xl:block" />
      </div>
    </div>

    <!-- Modales -->
    <CatalogEditModal
      v-model="editOpen"
      :mode="editMode"
      :model="editModel"
      :title="modalTitle"
      @save="onSaveEdit"
    />

    <ConfirmModal
      v-model="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      @confirm="onConfirmDelete"
    />
    <ColorEditModal
      v-model="colorOpen"
      :mode="colorMode"
      :model="colorModel"
      @save="onSaveColor"
    />
  </section>
</template>
