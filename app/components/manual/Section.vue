<script setup lang="ts">
import type { ManualSection } from "~/data/manual-content";

const props = defineProps<{
  section: ManualSection;
  defaultOpen?: boolean;
}>();

const isOpen = ref(props.defaultOpen ?? false);
const isNew = computed(() => props.section.isNew === true);

function getRoleBadgeClass(role: string): string {
  const map: Record<string, string> = {
    SUPER: "bg-gray-100 text-gray-700 border-gray-200",
    ADMIN: "bg-pink-50 text-pink-700 border-pink-200",
    EMPLOYEE: "bg-blue-50 text-blue-700 border-blue-200",
    BAKER: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return map[role] ?? "bg-gray-50 text-gray-600 border-gray-200";
}

// Expose open/close for external control (e.g. expand-all button)
defineExpose({ isOpen });
</script>

<template>
  <article
    :id="section.id"
    class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden scroll-mt-24"
  >
    <!-- Section header -->
    <div
      class="flex items-center gap-4 px-5 py-4 cursor-pointer select-none hover:bg-gray-50/80 transition-colors"
      :class="{ 'border-b border-gray-100': isOpen }"
      @click="isOpen = !isOpen"
    >
      <!-- Icon -->
      <div
        class="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        :class="
          isNew ? 'bg-gradient-to-br from-pink-100 to-purple-100' : 'bg-gray-50'
        "
      >
        {{ section.icon }}
      </div>

      <!-- Title & description -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="text-base font-bold text-gray-900">{{ section.title }}</h2>
          <span
            v-if="isNew"
            class="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          >
            Nuevo
          </span>
          <!-- Role badges -->
          <div class="flex gap-1 flex-wrap">
            <span
              v-for="role in section.roleAccess"
              :key="role"
              class="px-1.5 py-0.5 rounded text-xs font-medium border"
              :class="getRoleBadgeClass(role)"
            >
              {{ role }}
            </span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-0.5 truncate">
          {{ section.description }}
        </p>
      </div>

      <!-- Chevron -->
      <div
        class="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      >
        <svg
          class="w-4 h-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- Subsections -->
    <Transition name="section-expand">
      <div v-if="isOpen" class="divide-y divide-gray-50">
        <div
          v-for="(sub, idx) in section.subsections"
          :key="sub.id"
          class="px-5 py-5"
          :class="{ 'bg-pink-50/20': idx % 2 === 1 }"
        >
          <!-- Subsection title -->
          <h3
            class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"
          >
            <span
              class="w-1 h-4 rounded-full bg-gradient-to-b from-pink-400 to-purple-400 flex-shrink-0"
            />
            {{ sub.title }}
          </h3>

          <!-- Main content -->
          <p class="text-sm text-gray-600 leading-relaxed mb-3">
            {{ sub.content }}
          </p>

          <!-- Steps list -->
          <ol v-if="sub.steps?.length" class="space-y-2 mb-3">
            <li
              v-for="(step, i) in sub.steps"
              :key="i"
              class="flex items-start gap-3 text-sm text-gray-700"
            >
              <span
                class="flex-shrink-0 w-5 h-5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold flex items-center justify-center mt-0.5"
              >
                {{ i + 1 }}
              </span>
              <span class="leading-relaxed">{{ step }}</span>
            </li>
          </ol>

          <!-- Table -->
          <div
            v-if="sub.tableHeaders?.length"
            class="overflow-x-auto rounded-xl border border-gray-100 mb-3"
          >
            <table class="min-w-full text-xs">
              <thead>
                <tr class="bg-gradient-to-r from-pink-50 to-purple-50">
                  <th
                    v-for="header in sub.tableHeaders"
                    :key="header"
                    class="px-4 py-2.5 text-left font-bold text-gray-700 border-b border-gray-100"
                  >
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIdx) in sub.tableRows"
                  :key="rowIdx"
                  class="hover:bg-gray-50/80 transition-colors"
                  :class="{ 'bg-gray-50/40': rowIdx % 2 === 1 }"
                >
                  <td
                    v-for="(cell, cellIdx) in row"
                    :key="cellIdx"
                    class="px-4 py-2.5 text-gray-700 border-b border-gray-50 last:border-0"
                    :class="{ 'font-semibold text-gray-900': cellIdx === 0 }"
                  >
                    {{ cell }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tip -->
          <div
            v-if="sub.tip"
            class="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100 mb-2"
          >
            <span class="flex-shrink-0 text-base">💡</span>
            <p class="text-xs text-blue-800 leading-relaxed">
              <strong>Consejo:</strong> {{ sub.tip }}
            </p>
          </div>

          <!-- Warning -->
          <div
            v-if="sub.warning"
            class="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100"
          >
            <span class="flex-shrink-0 text-base">⚠️</span>
            <p class="text-xs text-amber-800 leading-relaxed">
              <strong>Importante:</strong> {{ sub.warning }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </article>
</template>

<style scoped>
.section-expand-enter-active,
.section-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.section-expand-enter-from,
.section-expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.section-expand-enter-to,
.section-expand-leave-from {
  opacity: 1;
  max-height: 4000px;
}
</style>
