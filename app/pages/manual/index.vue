<script setup lang="ts">
import { manualSections } from "~/data/manual-content";

// ── SEO ───────────────────────────────────────────────────────────────
useHead({
  title: "Manual de Usuario | Panel de Administración Pastelería Magnolias",
  meta: [
    {
      name: "description",
      content:
        "Centro de capacitación interactivo para el Panel de Administración de Pastelería Magnolias. Aprende a gestionar pedidos, productos, clientes, sucursales y usuarios.",
    },
    { name: "robots", content: "noindex, nofollow" }, // Internal tool
  ],
});

// ── State ────────────────────────────────────────────────────────────
const searchOpen = ref(false);
const mobileMenuOpen = ref(false);
const showBackToTop = ref(false);
const sectionRefs = ref<any[]>([]);

// ── Keyboard shortcut ────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    searchOpen.value = true;
  }
}

// ── Scroll helpers ───────────────────────────────────────────────────
function onScroll() {
  showBackToTop.value = window.scrollY > 400;
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleNavigate(sectionId: string) {
  // Open the section if collapsed
  const idx = manualSections.findIndex((s) => s.id === sectionId);
  if (idx !== -1 && sectionRefs.value[idx]) {
    sectionRefs.value[idx].isOpen = true;
  }
}

// ── Expand / Collapse all ────────────────────────────────────────────
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

// ── Lifecycle ────────────────────────────────────────────────────────
onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50/40">
    <!-- ── Search modal ── -->
    <ManualSearch v-model="searchOpen" @navigate="handleNavigate" />

    <!-- ── Sticky header ── -->
    <header
      class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4"
      >
        <!-- Logo/Brand -->
        <div class="flex items-center gap-2.5 flex-shrink-0">
          <div
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-black text-sm"
          >
            M
          </div>
          <span class="text-sm font-bold text-gray-900 hidden sm:block"
            >Magnolias</span
          >
          <span class="text-gray-300 hidden sm:block">/</span>
          <span class="text-sm text-gray-500 hidden sm:block">Manual</span>
        </div>

        <!-- Spacer -->
        <div class="flex-1" />

        <!-- Search trigger -->
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

        <!-- Mobile menu toggle -->
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

      <!-- Mobile navigation -->
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

    <!-- ── Hero ── -->
    <ManualHero
      @scroll-to-start="scrollToSection('proceso-inicio')"
      @open-search="searchOpen = true"
    />

    <!-- ── Main content layout ── -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex gap-8">
        <!-- ── Sidebar ── -->
        <ManualSidebar
          :sections="manualSections"
          @expand-all="expandAll"
          @collapse-all="collapseAll"
        />

        <!-- ── Content area ── -->
        <main class="flex-1 min-w-0 space-y-6">
          <!-- Global controls -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-gray-500">
              <strong class="text-gray-900">
                {{ manualSections.length }} secciones
              </strong>
              ·
              {{
                manualSections.reduce((acc, s) => acc + s.subsections.length, 0)
              }}
              subsecciones
            </p>
            <div class="flex gap-2">
              <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 hover:border-pink-300 hover:text-pink-700 transition-colors"
                @click="expandAll"
              >
                ⊞ Expandir todo
              </button>
              <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 hover:border-gray-400 transition-colors"
                @click="collapseAll"
              >
                ⊟ Contraer todo
              </button>
            </div>
          </div>

          <!-- ── SPECIAL: Proceso de inicio — Timeline visual ── -->
          <section id="proceso-inicio-timeline" class="scroll-mt-24">
            <div
              class="bg-white rounded-2xl border-2 border-pink-200 shadow-sm overflow-hidden"
            >
              <!-- Section badge header -->
              <div
                class="px-5 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white text-xl"
                  >
                    🚀
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h2 class="text-base font-bold text-gray-900">
                        Proceso de inicio del sistema
                      </h2>
                      <span
                        class="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                      >
                        Nuevo
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">
                      3 pasos que el administrador debe completar antes de todo
                    </p>
                  </div>
                </div>
              </div>
              <div class="p-5">
                <ManualTimeline />
              </div>
            </div>
          </section>

          <!-- ── Admin Checklist ── -->
          <section>
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div class="xl:col-span-1">
                <ManualChecklist />
              </div>
              <div class="xl:col-span-2">
                <ManualRoleCards />
              </div>
            </div>
          </section>

          <!-- ── All manual sections ── -->
          <ManualSection
            v-for="(section, idx) in manualSections"
            :key="section.id"
            ref="sectionRefs"
            :section="section"
            :default-open="idx === 0"
          />

          <!-- ── Back to top button ── -->
          <Transition name="modal-fade">
            <button
              v-if="showBackToTop"
              class="fixed bottom-8 right-8 z-30 w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center text-lg"
              @click="scrollToTop"
              aria-label="Volver arriba"
            >
              ↑
            </button>
          </Transition>
        </main>
      </div>
    </div>
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
