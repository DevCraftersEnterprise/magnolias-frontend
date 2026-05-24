<script setup lang="ts">
import type { ManualSection } from "~/data/manual-content";

defineProps<{
  sections: ManualSection[];
}>();

defineEmits<{
  expandAll: [];
  collapseAll: [];
}>();

const activeSection = ref<string>("");
const readingProgress = ref(0);

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateActiveSection() {
  // Reading progress
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  readingProgress.value =
    docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;

  // Active section detection
  const sections = document.querySelectorAll("[id]");
  let current = "";
  sections.forEach((section) => {
    const sectionTop = (section as HTMLElement).offsetTop - 120;
    if (scrollTop >= sectionTop) {
      current = section.getAttribute("id") ?? "";
    }
  });
  if (current) activeSection.value = current;
}

onMounted(() => {
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  updateActiveSection();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateActiveSection);
});
</script>

<template>
  <aside class="w-64 flex-shrink-0 hidden lg:block">
    <div class="sticky top-24 space-y-4">
      <!-- Sidebar header -->
      <div
        class="px-4 py-3 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100"
      >
        <p
          class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5"
        >
          Contenido
        </p>
        <p class="text-sm font-bold text-gray-900">Manual de Usuario</p>
        <!-- Reading progress -->
        <div class="mt-2">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs text-gray-500">Progreso</span>
            <span class="text-xs font-bold text-pink-600"
              >{{ Math.round(readingProgress) }}%</span
            >
          </div>
          <div class="h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-300"
              :style="{ width: readingProgress + '%' }"
            />
          </div>
        </div>
      </div>

      <!-- Navigation items -->
      <nav aria-label="Índice del manual">
        <ul class="space-y-0.5">
          <li v-for="section in sections" :key="section.id">
            <a
              :href="`#${section.id}`"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 group"
              :class="[
                activeSection === section.id
                  ? 'bg-pink-50 text-pink-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ]"
              @click.prevent="scrollToSection(section.id)"
            >
              <span class="text-base leading-none">{{ section.icon }}</span>
              <span class="truncate text-xs">{{ section.title }}</span>
              <span
                v-if="section.isNew"
                class="ml-auto flex-shrink-0 px-1.5 py-0.5 rounded-full text-xs font-bold bg-pink-500 text-white"
              >
                ✦
              </span>
              <div
                v-else-if="activeSection === section.id"
                class="ml-auto flex-shrink-0 w-1.5 h-1.5 rounded-full bg-pink-500"
              />
            </a>
          </li>
        </ul>
      </nav>

      <!-- Quick actions -->
      <div class="space-y-2">
        <button
          class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          @click="$emit('expandAll')"
        >
          <span>⊞</span> Expandir todo
        </button>
        <button
          class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          @click="$emit('collapseAll')"
        >
          <span>⊟</span> Contraer todo
        </button>
        <button
          class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          @click="scrollToTop"
        >
          <span>↑</span> Volver arriba
        </button>
      </div>
    </div>
  </aside>
</template>
