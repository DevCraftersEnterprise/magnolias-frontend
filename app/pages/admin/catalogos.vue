<!-- pages/admin/catalogos.vue -->
<script setup lang="ts">
definePageMeta({ layout: "admin", pageTitle: "Catálogos" });
useHead({ title: "Catálogos · Magnolias" });

import { type CatalogEditPayload } from "~/components/modals/CatalogEditModal.vue";
import { type ColorEditPayload } from "~/components/modals/ColorEditModal.vue";
import { catalogsService } from "~/services/catalogs.service";
import CatalogEditModal from "~/components/modals/CatalogEditModal.vue";
import ColorEditModal from "~/components/modals/ColorEditModal.vue";
import type {
  BreadTypeItem,
  ColorItem,
  FillingItem,
  FlavorItem,
  FlowerItem,
  FrostingItem,
  StyleItem,
} from "~/types/catalog.types";
import { useLoadMore } from "~/composables/useLoadMore";

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
const fillings = ref<FillingItem[]>([]);
const fillingsLoading = ref(false);
const fillingsLM = useLoadMore(loadFillings);

async function loadFillings() {
  fillingsLoading.value = true;
  try {
    const data = await catalogsService.getFillings(
      fillingsLM.limit.value,
      fillingsLM.offset.value,
    );

    fillings.value = [
      ...fillings.value,
      ...(data.items ?? []).filter((x) => x.isActive),
    ];
    fillingsLM.update(data.pagination);
  } finally {
    fillingsLoading.value = false;
  }
}

async function resetFillings() {
  fillings.value = [];
  fillingsLM.reset();
  await loadFillings();
}

/** ====== Sabores (API real) ====== */
const flavorsLoading = ref(false);
const flavors = ref<FlavorItem[]>([]);
const flavorsLM = useLoadMore(loadFlavors);

async function loadFlavors() {
  flavorsLoading.value = true;
  try {
    const data = await catalogsService.getFlavors(
      flavorsLM.limit.value,
      flavorsLM.offset.value,
    );
    flavors.value = [
      ...flavors.value,
      ...(data.items ?? []).filter((x) => x.isActive),
    ];
    flavorsLM.update(data.pagination);
  } finally {
    flavorsLoading.value = false;
  }
}

async function resetFlavors() {
  flavors.value = [];
  flavorsLM.reset();
  await loadFlavors();
}

/** ====== Frostings (API real) ====== */
const frostingsLoading = ref(false);
const frostings = ref<FrostingItem[]>([]);
const frostingsLM = useLoadMore(loadFrostings);

async function loadFrostings() {
  frostingsLoading.value = true;
  try {
    const data = await catalogsService.getFrostings(
      frostingsLM.limit.value,
      frostingsLM.offset.value,
    );
    frostings.value = [...frostings.value, ...data.items];
    frostingsLM.update(data.pagination);
  } finally {
    frostingsLoading.value = false;
  }
}

async function resetFrostings() {
  frostings.value = [];
  frostingsLM.reset();
  await loadFrostings();
}

/** ====== Styles (API real) ====== */
const stylesLoading = ref(false);
const styles = ref<StyleItem[]>([]);
const stylesLM = useLoadMore(loadStyles);

async function loadStyles() {
  stylesLoading.value = true;
  try {
    const data = await catalogsService.getStyles(
      stylesLM.limit.value,
      stylesLM.offset.value,
    );
    styles.value = [...styles.value, ...data.items];
    stylesLM.update(data.pagination);
  } finally {
    stylesLoading.value = false;
  }
}

async function resetStyles() {
  styles.value = [];
  stylesLM.reset();
  await loadStyles();
}

/** ====== Flowers (API real) ====== */
const flowersLoading = ref(false);
const flowers = ref<FlowerItem[]>([]);
const flowersLM = useLoadMore(loadFlowers);

async function loadFlowers() {
  flowersLoading.value = true;
  try {
    const data = await catalogsService.getFlowers(
      flowersLM.limit.value,
      flowersLM.offset.value,
    );
    flowers.value = [...flowers.value, ...data.items];
    flowersLM.update(data.pagination);
  } finally {
    flowersLoading.value = false;
  }
}

async function resetFlowers() {
  flowers.value = [];
  flowersLM.reset();
  await loadFlowers();
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
        await resetFillings();
        if (selected.value.relleno === item.name) selected.value.relleno = null;
      },

      sabor: async () => {
        await catalogsService.deleteFlavor(item.id);
        await resetFlavors();
        if (selected.value.sabor === item.name) selected.value.sabor = null;
      },

      cubierta: async () => {
        await catalogsService.deleteFrosting(item.id);
        await resetFrostings();
        if (selected.value.cubierta === item.name)
          selected.value.cubierta = null;
      },

      estilo: async () => {
        await catalogsService.deleteStyle(item.id);
        await resetStyles();
        if (selected.value.estilo === item.name) selected.value.estilo = null;
      },

      flor: async () => {
        await catalogsService.deleteFlower(item.id);
        await resetFlowers();
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
  { key: "pan", title: "Tipos de pan", items: panes, lm: null },
  { key: "relleno", title: "Rellenos", items: fillings, lm: fillingsLM },
  { key: "sabor", title: "Sabores", items: flavors, lm: flavorsLM },
  { key: "flor", title: "Flores", items: flowers, lm: flowersLM },
  { key: "estilo", title: "Estilos", items: styles, lm: stylesLM },
  { key: "color", title: "Colores", items: null, lm: null },
  {
    key: "cubierta",
    title: "Tipos de cubierta",
    items: frostings,
    lm: frostingsLM,
  },
];
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

              <div v-if="card.lm?.hasMore.value" class="text-center mt-2">
                <button
                  type="button"
                  class="px-3 py-1 text-sm font-medium text-[#1F1F1F] bg-white border border-[#1F1F1F] rounded-md hover:bg-[#F6F6F7]"
                  @click="card.lm?.loadMore()"
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
