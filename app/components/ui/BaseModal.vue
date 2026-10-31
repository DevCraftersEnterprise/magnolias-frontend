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
      class="fixed inset-0 z-[80]"
      @keydown.esc="close"
      tabindex="-1"
    >
      <!-- Overlay: fijo a toda la pantalla, independiente del scroll de abajo -->
      <div class="fixed inset-0 bg-black/50" @click="close" />

      <!-- Cliente: en pantallas chicas (o ventana baja) un formulario largo
           se salía de la pantalla y tapaba el título y los botones de
           acción, sin forma de hacer scroll. Este contenedor sí hace
           scroll, y el panel limita su alto a la ventana. -->
      <div
        class="relative h-full overflow-y-auto px-4 py-6 flex items-center justify-center"
      >
        <!-- Panel -->
        <div
          class="relative w-full max-w-[560px] max-h-full flex flex-col rounded-3xl bg-white shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-black/5 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <!-- Encabezado: siempre visible, no hace scroll -->
          <div class="shrink-0 px-6 pt-5 pb-4 flex items-start justify-between gap-4">
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

          <!-- Contenido: lo único que hace scroll si no cabe -->
          <div class="min-h-0 overflow-y-auto px-6 pb-4">
            <slot />
          </div>

          <!-- Pie con los botones de acción: siempre visible, no hace scroll -->
          <div
            v-if="$slots.footer"
            class="shrink-0 border-t border-black/5 px-6 py-4"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
