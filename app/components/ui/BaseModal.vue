<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
}>();

function close() {
  emit("update:modelValue", false);
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[80] flex items-center justify-center px-4"
      @keydown.esc="close"
      tabindex="-1"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" @click="close" />

      <!-- Panel -->
      <div
        class="relative w-full max-w-[560px] rounded-3xl bg-white shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-black/5 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div class="px-6 pt-5 pb-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3
                class="text-[20px] font-semibold tracking-[-0.02em] text-[#111827]"
              >
                <slot name="title" />
              </h3>
              <p v-if="$slots.subtitle" class="mt-1 text-[13px] text-gray-500">
                <slot name="subtitle" />
              </p>
            </div>

            <button
              type="button"
              class="grid h-9 w-9 place-items-center rounded-lg text-gray-500 hover:bg-black/5 hover:text-gray-800 transition"
              @click="close"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div class="mt-5">
            <slot />
          </div>
        </div>

        <div v-if="$slots.footer" class="border-t border-black/5 px-6 py-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
