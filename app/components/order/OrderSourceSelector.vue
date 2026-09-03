<script setup lang="ts">
import { ORDER_SOURCES, type OrderSourceValue } from "~/composables/useOrderLogistics";

defineProps<{
  orderSource: OrderSourceValue | "";
}>();

const emit = defineEmits<{
  (e: "update:orderSource", value: OrderSourceValue): void;
}>();
</script>

<template>
  <div>
    <label
      for="orderSource"
      class="block text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-2"
      >Canal de origen</label
    >
    <div class="relative max-w-xs">
      <select
        id="orderSource"
        :value="orderSource"
        class="w-full appearance-none rounded-xl bg-[#F3F3F4] pl-4 pr-9 py-2.5 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
        @change="
          emit(
            'update:orderSource',
            ($event.target as HTMLSelectElement).value as OrderSourceValue,
          )
        "
      >
        <option value="" disabled>Selecciona el canal…</option>
        <option
          v-for="src in ORDER_SOURCES"
          :key="src.value"
          :value="src.value"
        >
          {{ src.label }}
        </option>
      </select>
      <svg
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
    <p class="mt-1.5 text-[12px] text-gray-400">
      Por dónde se tomó el pedido — sirve para reportes de ventas por canal.
    </p>
  </div>
</template>
