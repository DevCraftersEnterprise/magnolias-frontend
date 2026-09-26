<script setup lang="ts">
import type { OrderDetailAssignmentCard } from "~/types/order.types";

const props = defineProps<{
  card: OrderDetailAssignmentCard;
  accent: "amber" | "violet" | "emerald";
  actionLabel?: string;
  disabled?: boolean;
}>();

defineEmits<{
  (e: "view"): void;
  (e: "advance"): void;
}>();

// Tailwind JIT necesita clases literales completas, no interpolación de
// strings - por eso un lookup por acento en vez de `bg-${accent}-400`.
const ACCENT_CLASSES: Record<
  "amber" | "violet" | "emerald",
  {
    bar: string;
    badgeBg: string;
    badgeText: string;
    btn: string;
    ready: string;
  }
> = {
  amber: {
    bar: "bg-amber-400",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    btn: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    ready: "text-emerald-600",
  },
  violet: {
    bar: "bg-violet-400",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-700",
    btn: "bg-violet-50 text-violet-700 hover:bg-violet-100",
    ready: "text-emerald-600",
  },
  emerald: {
    bar: "bg-emerald-400",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    btn: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    ready: "text-emerald-600",
  },
};

const classes = computed(() => ACCENT_CLASSES[props.accent]);
const hasPendingBalance = computed(() => {
  const raw = props.card.orderDetail.order.remainingBalance;
  return !!raw && parseFloat(String(raw)) > 0;
});
</script>

<template>
  <div
    class="bg-white rounded-xl ring-1 ring-black/[0.07] overflow-hidden hover:ring-black/[0.14] hover:shadow-sm transition"
  >
    <button
      type="button"
      class="block w-full text-left cursor-pointer"
      aria-label="Ver detalle del pedido"
      @click="$emit('view')"
    >
      <div class="h-1" :class="classes.bar"></div>
      <div class="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2">
        <span
          class="font-bold text-[13px] text-[#111827] leading-tight truncate"
          >{{ card.orderDetail.order.orderCode ?? "—" }}</span
        >
        <span
          class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 mt-0.5"
          :style="{ ...getOrderTypeColor(card.orderDetail.order) }"
          >{{ getOrderTypeLabel(card.orderDetail.order) }}</span
        >
      </div>
      <div class="px-3.5 pb-3 space-y-1.5 text-[12px] text-gray-500">
        <p class="font-medium text-[#111827] truncate">
          {{ card.orderDetail.product?.name ?? "Producto" }}
        </p>
        <div
          v-if="card.orderDetail.order.customer?.fullName"
          class="flex items-center gap-1.5 truncate"
        >
          <svg
            class="h-3 w-3 shrink-0 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span class="truncate">{{
            card.orderDetail.order.customer.fullName
          }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg
            class="h-3 w-3 shrink-0 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          {{ formatDate(card.orderDetail.order.deliveryDate)
          }}<span v-if="card.orderDetail.order.deliveryTime" class="text-gray-400">
            · {{ card.orderDetail.order.deliveryTime }}</span
          >
        </div>
        <div
          v-if="actionLabel && hasPendingBalance"
          class="flex items-center gap-1.5 text-orange-500 font-medium"
        >
          <svg
            class="h-3 w-3 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" stroke-linecap="round" />
          </svg>
          Saldo pendiente
        </div>
        <div
          v-if="!actionLabel"
          class="flex items-center gap-1.5 font-medium"
          :class="classes.ready"
        >
          <svg
            class="h-3 w-3 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Listo para entregar
        </div>
      </div>
    </button>
    <div v-if="actionLabel" class="border-t border-black/[0.06] px-3 py-2.5">
      <button
        class="w-full rounded-lg py-1.5 text-[12px] font-semibold transition disabled:opacity-40"
        :class="classes.btn"
        :disabled="disabled"
        @click="$emit('advance')"
      >
        {{ disabled ? "Actualizando…" : actionLabel }}
      </button>
    </div>
  </div>
</template>
