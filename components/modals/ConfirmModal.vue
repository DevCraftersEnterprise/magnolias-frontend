<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-black/60"
        @click="close"
      ></div>

      <div
        class="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
      >
        <div class="px-6 pt-6 pb-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h3 class="text-lg font-semibold text-[#111827]">
                ¿Está seguro de querer eliminar la imagen seleccionada?
              </h3>
            </div>

            <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-content-center rounded-xl hover:bg-black/5"
              aria-label="Cerrar"
              @click="close"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="px-6 pb-6">
          <div class="flex justify-center gap-3">
            <button
              type="button"
              class="h-10 min-w-[120px] rounded-xl bg-black/10 px-4 text-sm font-semibold text-black/80 hover:bg-black/15"
              @click="close"
            >
              Cancelar
            </button>

            <button
              type="button"
              class="h-10 min-w-[120px] rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white hover:brightness-110"
              @click="confirm"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm'): void
}>()

function close() {
  emit('update:modelValue', false)
}

function confirm() {
  emit('confirm')
  close()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>