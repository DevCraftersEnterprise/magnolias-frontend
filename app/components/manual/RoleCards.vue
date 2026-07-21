<script setup lang="ts">
import { roleCards } from "~/data/manual-content";
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    <div
      v-for="card in roleCards"
      :key="card.role"
      class="relative rounded-2xl border-2 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-default"
      :style="{ borderColor: card.color + '33', backgroundColor: card.bgColor }"
    >
      <!-- Header stripe -->
      <div
        class="px-4 py-3 flex items-center gap-3"
        :style="{ backgroundColor: card.color + '15' }"
      >
        <span class="text-2xl">{{ card.icon }}</span>
        <div>
          <p
            class="text-xs font-black uppercase tracking-widest"
            :style="{ color: card.color }"
          >
            {{ card.role }}
          </p>
          <p class="text-sm font-bold text-gray-900">{{ card.name }}</p>
        </div>
      </div>

      <!-- Permissions list -->
      <ul class="px-4 py-3 space-y-1.5">
        <li
          v-for="permission in card.permissions"
          :key="permission"
          class="flex items-start gap-2 text-xs text-gray-700"
        >
          <span class="flex-shrink-0 mt-0.5" :style="{ color: card.color }"
            >✓</span
          >
          <span>{{ permission }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
