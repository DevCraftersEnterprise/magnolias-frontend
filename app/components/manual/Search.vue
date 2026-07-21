<script setup lang="ts">
import { manualSections } from "~/data/manual-content";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  naviagte: [sectionId: string];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const query = ref("");
const searchInput = ref<HTMLInputElement | null>(null);

const suggestions = [
  "pedido",
  "sucursal",
  "catálogo",
  "usuario",
  "pastelero",
  "pago",
  "rol",
  "producto",
];

interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  sectionIcon: string;
  subsectionTitle: string;
  preview: string;
}

const results = computed<SearchResult[]>(() => {
  if (!query.value.trim()) return [];

  const q = query.value.toLowerCase();
  const out: SearchResult[] = [];

  manualSections.forEach((section) => {
    if (
      section.title.toLowerCase().includes(q) ||
      section.description.toLowerCase().includes(q)
    ) {
      out.push({
        sectionId: section.id,
        sectionTitle: section.title,
        sectionIcon: section.icon,
        subsectionTitle: section.title,
        preview: section.title,
      });
    }

    section.subsections.forEach((sub) => {
      const matchTitle = sub.title.toLowerCase().includes(q);
      const matchContent = sub.content.toLowerCase().includes(q);
      const matchSteps = sub.steps?.some((s) => s.toLowerCase().includes(q));
      const matchRows = sub.tableRows?.some((r) =>
        r.some((c) => c.toLowerCase().includes(q)),
      );

      if (matchTitle || matchContent || matchSteps || matchRows) {
        out.push({
          sectionId: section.id,
          sectionTitle: section.title,
          sectionIcon: section.icon,
          subsectionTitle: sub.title,
          preview: sub.content.slice(0, 120) + "...",
        });
      }
    });
  });

  const seen = new Set<string>();

  return out
    .filter((r) => {
      const key = `${r.sectionId}-${r.subsectionTitle}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
});

function navigateTo(result: SearchResult) {
  close();
  emit("naviagte", result.sectionId);
  nextTick(() => {
    const el = document.getElementById(result.sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function selectFirst() {
  if (results.value.length > 0) {
    navigateTo(results.value[0]!);
  }
}

function close() {
  isOpen.value = false;
  query.value = "";
}

watch(isOpen, (v) => {
  if (v) {
    nextTick(() => searchInput.value?.focus());
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
          @click="close"
        />

        <!-- Modal panel -->
        <div
          class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          <!-- Search input -->
          <div
            class="flex items-center gap-3 px-4 py-4 border-b border-gray-100"
          >
            <span class="text-gray-400 text-xl">🔍</span>
            <input
              ref="searchInput"
              v-model="query"
              type="text"
              placeholder="Buscar en el manual... (ej: pedido, sucursal, catálogo)"
              class="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              @keydown.escape="close"
              @keydown.enter="selectFirst"
            />
            <button
              class="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 transition-colors"
              @click="close"
            >
              ESC
            </button>
          </div>

          <!-- Results -->
          <div class="max-h-96 overflow-y-auto">
            <!-- Empty state -->
            <div v-if="!query" class="px-4 py-8 text-center">
              <p class="text-sm text-gray-400 mb-4">
                Escribe para buscar en el manual
              </p>
              <div class="flex flex-wrap gap-2 justify-center">
                <button
                  v-for="suggestion in suggestions"
                  :key="suggestion"
                  class="px-3 py-1.5 rounded-lg text-xs bg-gray-50 border border-gray-200 hover:border-pink-300 hover:bg-pink-50 text-gray-600 hover:text-pink-700 transition-colors"
                  @click="query = suggestion"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>

            <!-- No results -->
            <div v-else-if="results.length === 0" class="px-4 py-8 text-center">
              <p class="text-2xl mb-2">🔍</p>
              <p class="text-sm text-gray-500">
                No se encontraron resultados para <strong>"{{ query }}"</strong>
              </p>
            </div>

            <!-- Results list -->
            <ul v-else>
              <li
                v-for="(result, idx) in results"
                :key="idx"
                class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                @click="navigateTo(result)"
              >
                <span class="flex-shrink-0 text-lg mt-0.5">{{
                  result.sectionIcon
                }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-pink-600 font-medium mb-0.5">
                    {{ result.sectionTitle }}
                  </p>
                  <p class="text-sm font-semibold text-gray-900 truncate">
                    {{ result.subsectionTitle }}
                  </p>
                  <p class="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    {{ result.preview }}
                  </p>
                </div>
                <span class="flex-shrink-0 text-gray-300 mt-1">→</span>
              </li>
            </ul>
          </div>

          <!-- Footer -->
          <div
            class="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center gap-4 text-xs text-gray-400"
          >
            <span>↑↓ Navegar</span>
            <span>↵ Seleccionar</span>
            <span>ESC Cerrar</span>
            <span class="ml-auto"
              >{{ results.length }} resultado{{
                results.length !== 1 ? "s" : ""
              }}</span
            >
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
