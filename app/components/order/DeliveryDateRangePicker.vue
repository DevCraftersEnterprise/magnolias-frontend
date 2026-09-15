<script setup lang="ts">
const from = defineModel<string>("from", { required: true });
const to = defineModel<string>("to", { required: true });

defineProps<{ visible: boolean }>();

const fromId = useId();
const toId = useId();
</script>

<template>
  <Transition
    enter-active-class="transition duration-150"
    enter-from-class="opacity-0 -translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
  >
    <div v-if="visible" class="mt-3 flex flex-wrap items-center gap-2">
      <div class="flex items-center gap-1.5">
        <label
          :for="fromId"
          class="text-[11px] font-semibold text-gray-400 whitespace-nowrap"
          >Desde</label
        >
        <input
          :id="fromId"
          v-model="from"
          type="date"
          class="rounded-lg border border-black/10 bg-gray-50 px-3 py-1.5 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#C9007C]/30"
        />
      </div>
      <div class="flex items-center gap-1.5">
        <label
          :for="toId"
          class="text-[11px] font-semibold text-gray-400 whitespace-nowrap"
          >Hasta</label
        >
        <input
          :id="toId"
          v-model="to"
          type="date"
          class="rounded-lg border border-black/10 bg-gray-50 px-3 py-1.5 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#C9007C]/30"
        />
      </div>
      <button
        v-if="from || to"
        type="button"
        class="rounded-lg bg-gray-100 px-3 py-1.5 text-[12px] text-gray-500 hover:bg-gray-200 transition"
        @click="
          from = '';
          to = '';
        "
      >
        Limpiar
      </button>
    </div>
  </Transition>
</template>
