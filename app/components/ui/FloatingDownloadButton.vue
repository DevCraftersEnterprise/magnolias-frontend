<script setup lang="ts">
import { useToast } from "vue-toastification";

const toast = useToast();
const email = "devcrafters.enterprise@gmail.com";
const isHover = ref(false);

function copyEmail() {
  navigator.clipboard.writeText(email);
  toast.success("Correo copiado al portapapeles");
}

function downloadPDF() {
  toast.error(
    {
      component: {
        render() {
          return h(
            "div",
            {
              class:
                "flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-transparent text-white rounded-lg px-6 py-3",
            },
            [
              h(
                "span",
                { class: "font-medium" },
                "Después de llenar el formato, enviar al siguiente correo:",
              ),
              h(
                "span",
                { class: "ml-0 sm:ml-2 font-mono underline break-all" },
                email,
              ),
              h(
                "button",
                {
                  class:
                    "mt-2 sm:mt-0 ml-0 sm:ml-4 px-3 py-1 bg-white text-pink-600 font-semibold rounded hover:bg-pink-100 hover:text-pink-700 text-xs transition border border-pink-200",
                  onClick: copyEmail,
                },
                "Copiar correo",
              ),
            ],
          );
        },
      },
    },
    {
      timeout: 7000,
      toastClassName: "bg-transparent shadow-none p-0",
      closeButton: false,
    },
  );
  const link = document.createElement("a");
  link.href = "/format/formulario.pdf";
  link.download = "formulario.pdf";
  link.click();
}
</script>

<template>
  <button
    class="fixed bottom-8 right-8 z-50 bg-red-400 text-black rounded-full shadow-lg p-2 hover:bg-red-500 transition-all duration-300 flex items-center overflow-hidden group"
    @click="downloadPDF"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
    aria-label="Descargar formulario PDF"
    :style="{ width: isHover ? '150px' : '40px' }"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      class="lucide lucide-bug-icon lucide-bug flex-shrink-0"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 20v-9m2-4a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4zm.12-3.12L16 2"
      />
      <path
        d="M21 21a4 4 0 0 0-3.81-4M21 5a4 4 0 0 1-3.55 3.97M22 13h-4M3 21a4 4 0 0 1 3.81-4M3 5a4 4 0 0 0 3.55 3.97M6 13H2M8 2l1.88 1.88M9 7.13V6a3 3 0 1 1 6 0v1.13"
      />
    </svg>
    <span
      class="ml-3 whitespace-nowrap text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm"
      :class="{ 'opacity-100': isHover, 'opacity-0': !isHover }"
    >
      Reportar error
    </span>
  </button>
</template>
