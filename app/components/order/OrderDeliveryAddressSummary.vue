<script setup lang="ts">
import type { OrderDetailDeliveryAddress } from "~/types/order.types";

const props = defineProps<{
  address?: OrderDetailDeliveryAddress | null;
}>();

const addressLine = computed(() => {
  const a = props.address;
  if (!a) return "";
  return [
    a.street?.trim(),
    a.number ? `#${a.number}` : null,
    a.neighborhood?.trim(),
    a.city?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
});
</script>

<template>
  <div v-if="address" class="rounded-xl bg-[#F8F8F9] px-4 py-4 space-y-3">
    <div v-if="address.receiverName" class="flex items-center gap-3">
      <div
        class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-100"
      >
        <svg
          class="h-4 w-4 text-pink-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div>
        <p class="text-[13px] font-semibold text-[#111827]">
          {{ address.receiverName }}
        </p>
        <p v-if="address.receiverPhone" class="text-[12px] text-gray-500">
          {{ address.receiverPhone }}
        </p>
      </div>
    </div>
    <div v-if="addressLine" class="flex items-start gap-3">
      <div
        class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-100"
      >
        <svg class="h-4 w-4 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          />
        </svg>
      </div>
      <div class="pt-1 space-y-0.5">
        <p class="text-[13px] text-gray-700 leading-relaxed">
          {{ addressLine }}
        </p>
        <p v-if="address.postalCode" class="text-[12px] text-gray-500">
          CP {{ address.postalCode }}
        </p>
        <p v-if="address.betweenStreets" class="text-[12px] text-gray-500">
          Entre: {{ address.betweenStreets }}
        </p>
        <p v-if="address.interphoneCode" class="text-[12px] text-gray-500">
          Interfón: {{ address.interphoneCode }}
        </p>
        <p v-if="address.reference" class="text-[12px] text-gray-500">
          Ref: {{ address.reference }}
        </p>
      </div>
    </div>
    <div
      v-if="address.deliveryNotes"
      class="ml-11 rounded-lg bg-white px-3 py-2 ring-1 ring-black/5 text-[12px] text-gray-500 italic"
    >
      Nota: {{ address.deliveryNotes }}
    </div>
  </div>
</template>
