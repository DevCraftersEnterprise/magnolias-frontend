<script setup lang="ts">
import { adminChecklist } from "~/data/manual-content";

const STORAGE_KEY = "magnolias-manual-checklist";

const items = adminChecklist;

// Load from localStorage (client-only)
function loadChecked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

function saveChecked(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

const checked = ref<Set<string>>(loadChecked());

const checkedCount = computed(() => checked.value.size);
const progressPct = computed(() => (checked.value.size / items.length) * 100);
const allChecked = computed(() => checked.value.size === items.length);

function toggleItem(id: string) {
  const next = new Set(checked.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  checked.value = next;
  saveChecked(next);
}

function resetChecklist() {
  checked.value = new Set();
  saveChecked(new Set());
}
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
  >
    <!-- Header -->
    <div
      class="px-5 py-4 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-100"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-gray-900">
            Checklist del Administrador
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">
            {{ checkedCount }} de {{ items.length }} completados
          </p>
        </div>
        <div class="relative w-10 h-10">
          <svg class="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="#f3e8f5"
              stroke-width="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="url(#prog-gradient)"
              stroke-width="3"
              stroke-dasharray="100"
              :stroke-dashoffset="100 - progressPct"
              stroke-linecap="round"
              style="transition: stroke-dashoffset 0.4s ease"
            />
            <defs>
              <linearGradient
                id="prog-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stop-color="#ec4899" />
                <stop offset="100%" stop-color="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <span
            class="absolute inset-0 flex items-center justify-center text-xs font-bold text-pink-600"
          >
            {{ Math.round(progressPct) }}%
          </span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="mt-3 h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          class="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500"
          :style="{ width: progressPct + '%' }"
        />
      </div>
    </div>

    <!-- Checklist items -->
    <ul class="divide-y divide-gray-50">
      <li
        v-for="item in items"
        :key="item.id"
        class="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/60 transition-colors cursor-pointer"
        @click="toggleItem(item.id)"
      >
        <!-- Checkbox -->
        <div
          class="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
          :class="[
            checked.has(item.id)
              ? 'bg-gradient-to-br from-pink-500 to-purple-500 border-pink-500'
              : 'border-gray-300 bg-white hover:border-pink-400',
          ]"
        >
          <Transition name="check-pop">
            <svg
              v-if="checked.has(item.id)"
              class="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="3"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </Transition>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-semibold transition-colors"
            :class="
              checked.has(item.id)
                ? 'text-gray-400 line-through'
                : 'text-gray-900'
            "
          >
            {{ item.label }}
          </p>
          <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {{ item.description }}
          </p>
        </div>
      </li>
    </ul>

    <!-- Reset button -->
    <div class="px-5 py-3 border-t border-gray-100">
      <button
        class="text-xs text-gray-400 hover:text-red-500 transition-colors"
        @click="resetChecklist"
      >
        ↺ Reiniciar checklist
      </button>
    </div>

    <!-- Completion message -->
    <Transition name="modal-fade">
      <div
        v-if="allChecked"
        class="mx-5 mb-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg">🎉</span>
          <div>
            <p class="text-xs font-bold text-green-800">¡Todo listo!</p>
            <p class="text-xs text-green-700">
              El sistema está configurado y listo para capacitar a tu equipo.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.check-pop-enter-active {
  transition: all 0.15s ease;
}
.check-pop-enter-from {
  transform: scale(0);
  opacity: 0;
}
.check-pop-enter-to {
  transform: scale(1);
  opacity: 1;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
