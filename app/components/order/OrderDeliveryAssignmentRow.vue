<script setup lang="ts">
import type { OrderDeliveryAssignment } from "~/types/order.types";
import type { UserItem } from "~/types/user.types";

const props = defineProps<{
  orderId: string;
  assignment?: OrderDeliveryAssignment | null;
  drivers: UserItem[];
  loading?: boolean;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  (e: "assign", driverId: string): void;
}>();

const selectId = computed(() => `assignment-driver-${props.orderId}`);
const selectedDriverId = computed(() => props.assignment?.driver.id ?? "");

function onChange(event: Event) {
  const driverId = (event.target as HTMLSelectElement).value;
  if (!driverId) return;
  emit("assign", driverId);
}
</script>

<template>
  <div class="flex items-center gap-2">
    <label :for="selectId" class="text-[10px] text-gray-400 flex-shrink-0"
      >Repartidor</label
    >
    <div class="relative">
      <select
        :id="selectId"
        :value="selectedDriverId"
        :disabled="loading || readOnly"
        :title="readOnly ? 'No se puede reasignar un pedido entregado o cancelado' : undefined"
        class="appearance-none rounded-lg bg-white pl-2.5 pr-7 py-1 text-[12px] text-[#111827] outline-none ring-1 ring-black/8 focus:ring-2 focus:ring-teal-300 cursor-pointer disabled:opacity-50"
        @change="onChange"
      >
        <option value="" disabled>Sin asignar</option>
        <option v-for="d in drivers" :key="d.id" :value="d.id">
          {{ d.name }} {{ d.lastname }}
        </option>
      </select>
    </div>
    <div
      v-if="loading"
      class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black/10 border-t-teal-500"
    />
  </div>
</template>
