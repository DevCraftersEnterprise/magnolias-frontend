<script setup lang="ts">
import { useToast } from "vue-toastification";

const toast = useToast();
const isHover = ref(false);

function downloadPDF() {
  toast.info(
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
                "Aprende sobre el funcionamiento del sistema",
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
  link.href = "/format/manual.pdf";
  link.download = "manual.pdf";
  link.click();
}
</script>

<template>
  <button
    class="bg-pink-400 text-black rounded-full shadow-lg p-2 hover:bg-pink-500 transition-all duration-300 flex items-center overflow-hidden group"
    @click="downloadPDF"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
    aria-label="Descargar manual PDF"
    :style="{ width: isHover ? '180px' : '40px' }"
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
      class="lucide lucide-notebook-text flex-shrink-0"
      viewBox="0 0 24 24"
    >
      <path d="M2 6h4m-4 4h4m-4 4h4m-4 4h4" />
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M9.5 8h5m-5 4H16m-6.5 4H14" />
    </svg>
    <span
      class="ml-3 whitespace-nowrap text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm"
      :class="{ 'opacity-100': isHover, 'opacity-0': !isHover }"
    >
      Manual de usuario
    </span>
  </button>
</template>
