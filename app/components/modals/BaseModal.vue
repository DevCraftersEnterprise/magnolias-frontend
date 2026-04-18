<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
    <div class="absolute inset-0 bg-black/60" @click="emit('close')"></div>

    <div class="relative w-full max-w-lg my-auto">
      <div class="rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 flex flex-col max-h-[90vh]">
        <div class="px-6 pt-6 shrink-0">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-[#111827]">{{ title }}</h3>
              <p v-if="subtitle" class="mt-1 text-xs text-black/50">{{ subtitle }}</p>
            </div>

            <button
              class="grid h-9 w-9 place-content-center rounded-xl hover:bg-black/5"
              @click="emit('close')"
              aria-label="Cerrar"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="px-6 pb-6 pt-4 overflow-y-auto">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>