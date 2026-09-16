<script setup lang="ts">
import type { ProductSize } from "~/types/order.types";

export type CatalogEditPayload = {
  id?: string;
  name: string;
  description?: string;
  price?: number;
  applicableSizes?: ProductSize[];
};

const ALL_SIZES: ProductSize[] = [
  "10P",
  "15P",
  "20P",
  "25P",
  "30P",
  "40P",
  "50P",
  "CUSTOM",
];

const open = defineModel<boolean>({ required: true });

const props = defineProps<{
  mode: "create" | "edit";
  model: CatalogEditPayload | null;
  title?: string; // ✅ NUEVO
  // Cliente #5: solo el catálogo de Forma (estilo) restringe tamaños.
  showApplicableSizes?: boolean;
  // Cliente: forma y tamaño no deben manejar precio.
  hidePrice?: boolean;
}>();

const emit = defineEmits<{
  (e: "save", payload: CatalogEditPayload): void;
}>();

const local = reactive<CatalogEditPayload>({
  id: undefined,
  name: "",
  description: "",
  price: undefined,
  applicableSizes: [],
});

watch(
  () => props.model,
  (m) => {
    local.id = m?.id;
    local.name = m?.name ?? "";
    local.description = m?.description ?? "";
    local.price = m?.price;
    local.applicableSizes = m?.applicableSizes ? [...m.applicableSizes] : [];
  },
  { immediate: true },
);

function toggleSize(size: ProductSize) {
  const sizes = local.applicableSizes ?? [];
  local.applicableSizes = sizes.includes(size)
    ? sizes.filter((s) => s !== size)
    : [...sizes, size];
}

function submit() {
  emit("save", {
    id: local.id,
    name: local.name,
    description: local.description,
    price: props.hidePrice ? undefined : local.price,
    applicableSizes:
      props.showApplicableSizes && local.applicableSizes?.length
        ? local.applicableSizes
        : undefined,
  });
}
</script>

<template>
  <UiBaseModal v-model="open">
    <template #title>
      {{
        title || (mode === "create" ? "Agregar elemento" : "Editar elemento")
      }}
    </template>

    <div class="space-y-3">
      <div>
        <label class="block text-[12px] font-semibold text-gray-600 mb-1"
          >Nombre</label
        >
        <input
          v-model.trim="local.name"
          type="text"
          class="w-full h-11 rounded-xl bg-gray-100 px-4 text-[14px] outline-none ring-2 ring-transparent focus:ring-black/10"
          placeholder="Nombre"
        />
      </div>

      <div>
        <label class="block text-[12px] font-semibold text-gray-600 mb-1"
          >Descripción</label
        >
        <textarea
          v-model.trim="local.description"
          rows="4"
          class="w-full rounded-xl bg-gray-100 px-4 py-3 text-[14px] outline-none ring-2 ring-transparent focus:ring-black/10 resize-none"
          placeholder="Descripción"
        />
      </div>

      <div v-if="!hidePrice">
        <label
          for="catalog-price"
          class="block text-[12px] font-semibold text-gray-600 mb-1"
          >Precio</label
        >
        <input
          id="catalog-price"
          v-model.number="local.price"
          type="number"
          min="0"
          step="0.01"
          class="w-full h-11 rounded-xl bg-gray-100 px-4 text-[14px] outline-none ring-2 ring-transparent focus:ring-black/10"
          placeholder="0.00"
        />
      </div>

      <div v-if="showApplicableSizes">
        <p class="text-[12px] font-semibold text-gray-600 mb-1">
          Tamaños aplicables
        </p>
        <p class="text-[11px] text-gray-400 mb-2">
          Sin selección, aplica para cualquier tamaño.
        </p>
        <div class="flex flex-wrap gap-2">
          <label
            v-for="size in ALL_SIZES"
            :key="size"
            class="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-[12px] cursor-pointer select-none"
          >
            <input
              type="checkbox"
              :checked="(local.applicableSizes ?? []).includes(size)"
              class="h-3.5 w-3.5 rounded border-gray-300 accent-[#FC9AD3]"
              @change="toggleSize(size)"
            />
            {{ PRODUCT_SIZE_LABELS[size] }}
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          class="h-10 rounded-lg px-4 text-[13px] font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          @click="open = false"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="h-10 rounded-lg px-4 text-[13px] font-semibold bg-[#1F1F1F] text-white hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="!local.name"
          @click="submit"
        >
          Guardar
        </button>
      </div>
    </template>
  </UiBaseModal>
</template>
