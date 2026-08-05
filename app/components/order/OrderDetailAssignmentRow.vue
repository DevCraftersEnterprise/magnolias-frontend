<script setup lang="ts">
import type { OrderLineAssignment } from "~/types/order.types";
import type { UserItem } from "~/types/user.types";

const props = defineProps<{
  detailId: string;
  assignment?: OrderLineAssignment | null;
  bakers: UserItem[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "assign", bakerId: string): void;
}>();

const selectId = computed(() => `assignment-baker-${props.detailId}`);
const selectedBakerId = computed(() => props.assignment?.baker.id ?? "");

function onChange(event: Event) {
  const bakerId = (event.target as HTMLSelectElement).value;
  if (!bakerId) return;
  emit("assign", bakerId);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <label
      :for="selectId"
      class="text-[10px] text-gray-400 flex-shrink-0"
    >Repostero</label>
    <div class="relative">
      <select
        :id="selectId"
        :value="selectedBakerId"
        :disabled="loading"
        class="appearance-none rounded-lg bg-white pl-2.5 pr-7 py-1 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer disabled:opacity-50"
        @change="onChange"
      >
        <option value="" disabled>Sin asignar</option>
        <option v-for="b in bakers" :key="b.id" :value="b.id">
          {{ b.name }} {{ b.lastname }}
        </option>
      </select>
    </div>
    <div
      v-if="loading"
      class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"
    />
  </div>
</template>
