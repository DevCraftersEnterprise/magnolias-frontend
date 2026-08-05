<script setup lang="ts">
import type { TierRow } from "~/composables/useProductBuilder";

defineProps<{
  tiers: TierRow[];
  colorName: (colorId: string) => string;
  catalogLabel: (catalog: { id: string; name: string }[], id: string) => string;
  breadTypes: { id: string; name: string }[];
  fillings: { id: string; name: string }[];
  frostings: { id: string; name: string }[];
}>();
</script>

<template>
  <div class="py-2 space-y-2">
    <div
      v-for="(t, tIdx) in tiers"
      :key="t.localId"
      class="rounded-lg bg-[#F8F8F9] px-3 py-2"
    >
      <p
        class="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1"
      >
        Piso {{ tIdx + 1 }}
      </p>
      <p class="text-[12px] text-[#111827]">
        {{
          [
            t.sizeId === "CUSTOM" ? t.customSize : t.sizeId || null,
            t.colorId ? colorName(t.colorId) : null,
            t.breadId ? catalogLabel(breadTypes, t.breadId) : null,
            t.fillingId ? catalogLabel(fillings, t.fillingId) : null,
            t.frostingId ? catalogLabel(frostings, t.frostingId) : null,
          ]
            .filter(Boolean)
            .join(" · ") || "—"
        }}
      </p>
    </div>
  </div>
</template>
