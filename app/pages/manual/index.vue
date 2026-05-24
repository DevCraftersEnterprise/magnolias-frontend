<script setup lang="ts">
import { manualSections } from "~/data/manual-content";

useHead({
  title: "Manual de Usuario | Panel de Administración Pastelería Magnolias",
  meta: [
    {
      name: "description",
      content:
        "Centro de capacitación interactivo para el Panel de Administración de Pastelería Magnolias. Aprende a gestionar pedidos, productos, clientes, sucursales y usuarios.",
    },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
});

const searchOpen = ref(false);
const mobileMenuOpen = ref(false);
const showBackTop = ref(false);
const sectionRefs = ref<any[]>([]);

function onKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    searchOpen.value = true;
  }
}

function onScroll() {
  showBackTop.value = window.screenY > 400;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleNavigate(sectionId: string) {
  const idx = manualSections.findIndex((s) => s.id === sectionId);

  if (idx !== -1 && sectionRefs.value[idx]) {
    sectionRefs.value[idx].isOpen = true;
  }
}

function expandAll() {
  sectionRefs.value.forEach((ref) => {
    if (ref) ref.isOpen = true;
  });
}

function collapseAll() {
  sectionRefs.value.forEach((ref) => {
    if (ref) ref.isOpen = false;
  });
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50/40">
    <ManualSearch v-model="searchOpen" @naviagte="handleNavigate" />

    <header
      class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4"
      >
        <div class="flex items-center gap-2.5 flex-shrink-0">
          <div
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-black text-sm select-none"
          >
            M
          </div>
          <span
            class="text-sm font-bold text-gray-900 hidden sm:block select-none"
          >
            Magnolias
          </span>
          <span class="text-gray-300 hidden sm:block select-none">/</span>
          <span class="text-sm text-gray-500 hidden sm:block select-none">
            Manual
          </span>
        </div>

        <div class="flex-1"></div>

        <button
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
          @click="searchOpen = true"
        >
          <span>🔍</span>
          <span class="hidden sm:block">Buscar...</span>
          <kbd
            class="hidden sm:block text-xs bg-white border border-gray-200 rounded px-1"
            >⌘K</kbd
          >
        </button>

        <button
          class="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Abrir menú"
        >
          <svg
            class="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <Transition name="slide-down">
        <div
          v-if="mobileMenuOpen"
          class="lg:hidden border-t border-gray-100 bg-white px-4 py-3"
        >
          <nav class="flex flex-wrap gap-2">
            <button
              v-for="section in manualSections"
              :key="section.id"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 hover:bg-pink-50 hover:text-pink-700 transition-colors"
              @click="
                scrollToSection(section.id);
                mobileMenuOpen = false;
              "
            >
              {{ section.icon }} {{ section.title }}
            </button>
          </nav>
        </div>
      </Transition>
    </header>

    <ManualHero
      @scroll-to-start="scrollToSection('proceso-inicio')"
      @open-search="searchOpen = true"
    />
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 300px;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
