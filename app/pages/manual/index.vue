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
