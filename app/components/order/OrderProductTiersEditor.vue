<script setup lang="ts">
import type { TierRow } from "~/composables/useProductBuilder";
import type { ProductSize } from "~/types/order.types";

defineProps<{
  tiers: TierRow[];
  colorCatalog: { id: string; name: string; value: string }[];
  breadTypes: { id: string; name: string }[];
  fillings: { id: string; name: string }[];
  frostings: { id: string; name: string }[];
  minTiers: number;
}>();

const emit = defineEmits<{
  (e: "add-tier"): void;
  (e: "remove-tier", tierIndex: number): void;
}>();

const SIZE_OPTIONS: { value: ProductSize; label: string }[] = [
  { value: "10P", label: "10 P" },
  { value: "15P", label: "15 P" },
  { value: "20P", label: "20 P" },
  { value: "25P", label: "25 P" },
  { value: "30P", label: "30 P" },
  { value: "40P", label: "40 P" },
  { value: "50P", label: "50 P" },
  { value: "CUSTOM", label: "Personalizado" },
];
</script>

<template>
  <div class="px-4 py-3 space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-[12px] font-semibold text-gray-500"
        >Pisos ({{ tiers.length }})</span
      >
      <button
        type="button"
        @click="emit('add-tier')"
        class="flex items-center gap-1 rounded-lg bg-[#F3F3F4] px-2.5 py-1.5 text-[11px] font-semibold text-[#C9007C] ring-1 ring-black/8 hover:ring-[#FC9AD3]/60 transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M12 5v14M5 12h14" stroke-linecap="round" />
        </svg>
        Agregar piso
      </button>
    </div>

    <div
      v-for="(tier, tIdx) in tiers"
      :key="tier.localId"
      class="rounded-lg bg-[#F8F8F9] ring-1 ring-black/8 px-3 py-3 space-y-2"
    >
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold uppercase tracking-wide text-gray-400"
          >Piso {{ tier.position }}</span
        >
        <button
          v-if="tiers.length > minTiers"
          type="button"
          @click="emit('remove-tier', tIdx)"
          class="text-[11px] text-gray-400 hover:text-red-400"
        >
          Quitar
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div class="flex items-center gap-2">
          <span class="text-[12px] font-medium text-gray-500 flex-shrink-0"
            >Tamaño</span
          >
          <div class="relative">
            <select
              v-model="tier.sizeId"
              class="appearance-none rounded-lg bg-white pl-2.5 pr-7 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
            >
              <option value="">—</option>
              <option v-for="o in SIZE_OPTIONS" :key="o.value" :value="o.value">
                {{ o.label }}
              </option>
            </select>
          </div>
          <input
            v-if="tier.sizeId === 'CUSTOM'"
            v-model="tier.customSize"
            type="text"
            placeholder="ej. 100 personas"
            class="w-28 rounded-lg bg-white px-2.5 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60"
          />
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[12px] font-medium text-gray-500 flex-shrink-0"
            >Color</span
          >
          <div class="relative">
            <select
              v-model="tier.colorId"
              class="appearance-none rounded-lg bg-white pl-2.5 pr-7 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
            >
              <option value="">—</option>
              <option v-for="c in colorCatalog" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[12px] font-medium text-gray-500 flex-shrink-0"
            >Tipo de Pan</span
          >
          <div class="relative">
            <select
              v-model="tier.breadId"
              class="appearance-none rounded-lg bg-white pl-2.5 pr-7 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
            >
              <option value="">—</option>
              <option v-for="b in breadTypes" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[12px] font-medium text-gray-500 flex-shrink-0"
            >Relleno</span
          >
          <div class="relative">
            <select
              v-model="tier.fillingId"
              class="appearance-none rounded-lg bg-white pl-2.5 pr-7 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
            >
              <option value="">—</option>
              <option v-for="f in fillings" :key="f.id" :value="f.id">
                {{ f.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[12px] font-medium text-gray-500 flex-shrink-0"
            >Frosting</span
          >
          <div class="relative">
            <select
              v-model="tier.frostingId"
              class="appearance-none rounded-lg bg-white pl-2.5 pr-7 py-1.5 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
            >
              <option value="">—</option>
              <option v-for="f in frostings" :key="f.id" :value="f.id">
                {{ f.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
