<script setup lang="ts">
defineProps<{
  hasTiers: boolean;
  price: number;
  catalogPriceSum: number;
}>();
</script>

<template>
  <div
    v-if="!hasTiers && catalogPriceSum > 0"
    class="flex justify-between py-2"
  >
    <span class="text-[12px] text-gray-500">Precio sugerido de catálogo</span>
    <span class="text-[12px] font-semibold text-[#C9007C]">{{
      formatMXN(catalogPriceSum)
    }}</span>
  </div>
  <div class="flex justify-between py-2">
    <span class="text-[12px] text-gray-500">Precio capturado (línea)</span>
    <span class="text-[12px] font-semibold text-[#111827]">{{
      formatMXN(price)
    }}</span>
  </div>
</template>
