<script setup lang="ts">
import type { PhoneSearchMode } from "~/composables/useCustomerLookup";

defineProps<{
  phoneQuery: string;
  phoneSearchMode: PhoneSearchMode;
  searching: boolean;
}>();

const emit = defineEmits<{
  input: [e: Event];
  search: [];
  "set-mode": [mode: PhoneSearchMode];
}>();

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    emit("search");
    return;
  }
  if (e.key.length === 1 && !/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
  }
}
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <label
        for="customerSearchPhone"
        class="block text-[13px] font-semibold text-gray-600"
        >Teléfono:</label
      >
      <fieldset class="flex items-center rounded-lg bg-[#F3F3F4] p-0.5 text-[12px] border-0 m-0">
        <legend class="sr-only">Modo de búsqueda por teléfono</legend>
        <button
          type="button"
          class="rounded-md px-2.5 py-1 transition"
          :class="phoneSearchMode === 'prefix' ? 'bg-white shadow-sm text-[#111827]' : 'text-gray-500'"
          @click="emit('set-mode', 'prefix')"
        >
          Teléfono
        </button>
        <button
          type="button"
          class="rounded-md px-2.5 py-1 transition"
          :class="phoneSearchMode === 'last4' ? 'bg-white shadow-sm text-[#111827]' : 'text-gray-500'"
          @click="emit('set-mode', 'last4')"
        >
          Últimos 4
        </button>
      </fieldset>
    </div>
    <div class="relative">
      <input
        id="customerSearchPhone"
        :value="phoneQuery"
        @input="emit('input', $event)"
        @keydown="onKeydown"
        type="tel"
        inputmode="numeric"
        :maxlength="phoneSearchMode === 'last4' ? 4 : 10"
        class="w-full h-12 rounded-xl px-4 pr-12 text-[14px] ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/50 placeholder:text-gray-400 transition"
        :placeholder="phoneSearchMode === 'last4' ? 'Últimos 4 dígitos' : 'Ingresa número de teléfono'"
      />
      <button
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-lg hover:bg-black/5 transition"
        :class="searching ? 'text-[#FC9AD3]' : 'text-gray-400'"
        @click="emit('search')"
      >
        <div
          v-if="searching"
          class="h-4 w-4 rounded-full border-2 border-black/10 border-t-[#FC9AD3] animate-spin"
        />
        <svg
          v-else
          viewBox="0 0 24 24"
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </button>
    </div>
    <p class="mt-1.5 text-[12px] text-gray-400">
      Presiona Enter o el ícono para buscar.
    </p>
  </div>
</template>
