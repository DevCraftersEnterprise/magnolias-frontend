<script setup lang="ts">
import { h } from "vue";
import { useToast } from "vue-toastification";

const toast = useToast();
const email = "devcrafters.enterprise@gmail.com";

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
                "Después de llenarlo, enviar al siguiente correo:",
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
  window.open("/format/formulario.pdf", "_blank");
}
</script>

<template>
  <button
    class="fixed bottom-8 right-8 z-50 bg-[#f3b7d1]/80 text-white rounded-full shadow-lg p-4 hover:bg-[#f3b7d1] transition"
    @click="downloadPDF"
    aria-label="Descargar formulario PDF"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      class="h-6 w-6"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5m-5-6v12"
      />
    </svg>
  </button>
</template>
