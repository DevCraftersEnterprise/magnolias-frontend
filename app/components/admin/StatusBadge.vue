<script setup lang="ts">
defineProps<{
  isActive: boolean;
}>();
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
    :class="
      isActive ? 'bg-green-100 text-green-700' : 'bg-black/8 text-black/50'
    "
  >
    <span
      class="h-1.5 w-1.5 rounded-full"
      :class="isActive ? 'bg-green-500' : 'bg-black/30'"
    />
    {{ isActive ? "Activo" : "Inactivo" }}
  </span>
</template>
