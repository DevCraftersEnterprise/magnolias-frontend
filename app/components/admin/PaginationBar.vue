<template>
  <div class="mt-4 flex items-center justify-between">
    <p class="text-[12px] text-gray-500">
      Mostrando {{ from }}–{{ to }} de {{ total }} · Página {{ currentPage }} de
      {{ totalPages }}
    </p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="h-9 rounded-xl px-4 text-[13px] font-semibold bg-[#E9EAED] text-[#111827] hover:bg-[#DDE0E6] transition disabled:opacity-60"
        :disabled="!canPrev"
        @click="$emit('prev')"
      >
        Anterior
      </button>
      <button
        type="button"
        class="h-9 rounded-xl px-4 text-[13px] font-semibold bg-[#111827] text-white hover:bg-black transition disabled:opacity-60"
        :disabled="!canNext"
        @click="$emit('next')"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  from: number;
  to: number;
  total: number;
  currentPage: number;
  totalPages: number;
  canPrev: boolean;
  canNext: boolean;
}>();

defineEmits<{
  (e: "prev"): void;
  (e: "next"): void;
}>();
</script>
