<script setup lang="ts">
import { ORDER_MODES, type OrderModeKey } from "~/composables/useOrderLogistics";

defineProps<{
  orderMode: OrderModeKey | null;
  includesFlowers: boolean;
}>();

const emit = defineEmits<{
  (e: "select-mode", mode: OrderModeKey): void;
  (e: "update:includesFlowers", value: boolean): void;
}>();
</script>

<template>
  <fieldset>
    <legend
      class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3"
    >
      Tipo de pedido
    </legend>
    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="t in ORDER_MODES"
        :key="t.key"
        type="button"
        @click="emit('select-mode', t.key)"
        :class="[
          'relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 transition-all',
          orderMode === t.key
            ? 'border-[#FC9AD3] bg-pink-50 shadow-sm'
            : 'border-black/10 hover:border-[#FC9AD3]/60 hover:bg-pink-50/40',
        ]"
      >
        <!-- Checkmark badge -->
        <span
          v-if="orderMode === t.key"
          class="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FC9AD3]"
        >
          <svg
            viewBox="0 0 12 12"
            class="h-2.5 w-2.5"
            fill="none"
            stroke="white"
            stroke-width="2"
          >
            <path
              d="M2 6l3 3 5-5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>

        <!-- Icon -->
        <span class="text-2xl leading-none select-none">
          <template v-if="t.icon === 'delivery'">🛵</template>
          <template v-else-if="t.icon === 'shop'">🏪</template>
          <template v-else-if="t.icon === 'event'">🎉</template>
          <template v-else>📦</template>
        </span>

        <span class="text-[13px] font-semibold text-[#111827] text-center"
          >{{ t.label }}</span
        >
        <span class="text-[11px] text-gray-400 text-center leading-tight"
          >{{ t.sub }}</span
        >
      </button>
    </div>

    <!-- Incluye flores: check independiente, combinable con cualquier modo -->
    <label
      class="mt-4 flex items-center gap-2 cursor-pointer select-none w-fit"
    >
      <input
        type="checkbox"
        :checked="includesFlowers"
        @change="
          emit(
            'update:includesFlowers',
            ($event.target as HTMLInputElement).checked,
          )
        "
        class="h-4 w-4 rounded accent-[#FC9AD3]"
      />
      <span class="text-[13px] font-medium text-gray-700"
        >🌸 Incluye flores</span
      >
    </label>
  </fieldset>
</template>
