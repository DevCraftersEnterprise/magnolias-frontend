<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["auth", "baker-redirect"],
  pageTitle: "Panel Administrativo",
});
useHead({ title: "Panel · Magnolias" });

import { dashboardService } from "~/services/dashboard.service";

// ─── Composables ─────────────────────────────────────────────────────────────
const { selectedBranch } = useBranch();
const { user } = useAuthUser();

// ─── Types ───────────────────────────────────────────────────────────────────
type OrderSummaryItem = {
  key: string;
  label: string;
  value: number;
  icon: string;
  backgroundColor?: string;
  textColor?: string;
};

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(true);
const errorMsg = ref("");
const orderSummary = ref<OrderSummaryItem[]>([]);
const orderTypeSummary = ref<OrderSummaryItem[]>([]);

// ─── Load ────────────────────────────────────────────────────────────────────
async function loadOrderStatistics() {
  try {
    const { data } = await dashboardService.getOrderStatus({
      branchId: selectedBranch.value?.id,
    });

    orderSummary.value = [
      {
        key: "created",
        label: "Creados",
        value: data.created,
        icon: "created",
        backgroundColor: "#B9FFC6",
        textColor: "#00C91D",
      },
      {
        key: "in_process",
        label: "En proceso",
        value: data.in_process,
        icon: "process",
        backgroundColor: "#FFF8A9",
        textColor: "#C7B400",
      },
      {
        key: "done",
        label: "Terminados",
        value: data.done,
        icon: "done",
        backgroundColor: "#B9D9FF",
        textColor: "#0047C9",
      },
      {
        key: "delivered",
        label: "Entregados",
        value: data.delivered,
        icon: "delivered",
        backgroundColor: "#FFD9B9",
        textColor: "#C94A00",
      },
      {
        key: "cancelled",
        label: "Cancelados",
        value: data.cancelled,
        icon: "cancelled",
        backgroundColor: "#FFD9D9",
        textColor: "#C90000",
      },
    ];

    orderTypeSummary.value = [
      {
        key: "store",
        label: "Vitrina",
        value: data.order_type_counts.vitrina,
        icon: "store",
        backgroundColor: "#ADADAD",
        textColor: "#000000",
      },
      {
        key: "event",
        label: "Evento",
        value: data.order_type_counts.evento,
        icon: "event",
        backgroundColor: "#AAE9FA",
        textColor: "#007C8A",
      },
      {
        key: "delivery",
        label: "Domicilio",
        value: data.order_type_counts.domicilio,
        icon: "delivery",
        backgroundColor: "#E6ABFA",
        textColor: "#7C00C9",
      },
      {
        key: "custom",
        label: "Flor",
        value: data.order_type_counts.personalizado,
        icon: "flower",
        backgroundColor: "#FFBEE6",
        textColor: "#C9007C",
      },
    ];
  } catch (error) {
    errorMsg.value = "Error al cargar las estadísticas del dashboard.";
    console.error(error);
  } finally {
    loading.value = false;
  }
}

// ─── Lifecycle & watchers ───────────────────────────────────────────────────
const isBaker = user.value?.role === "BAKER";

onMounted(() => {
  if (!isBaker) loadOrderStatistics();
});
watch(selectedBranch, () => {
  if (!isBaker) loadOrderStatistics();
});
</script>

<template>
  <section>
    <div
      class="rounded-[28px] border border-[#F3DCE8] bg-white p-5 shadow-[0_10px_24px_rgba(226,184,206,0.16)] sm:p-6 mb-5"
    >
      <div class="mb-5">
        <h2 class="text-[20px] font-bold text-[#1E1E1E]">
          Resumen general de pedidos
        </h2>
      </div>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminOrderSummaryCard
          v-for="item in orderSummary"
          :key="item.key"
          :item="item"
          label="Pedidos"
        />
      </div>
    </div>

    <div
      class="rounded-[28px] border border-[#F3DCE8] bg-white p-5 shadow-[0_10px_24px_rgba(226,184,206,0.16)] sm:p-6"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div class="mb-5">
            <h2 class="text-[20px] font-bold text-[#1E1E1E]">
              Resumen por tipo de pedido
            </h2>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-2 gap-4">
            <AdminOrderSummaryCard
              v-for="item in orderTypeSummary"
              :key="item.key"
              :item="item"
              label="Tipos"
            />
          </div>
        </div>
        <div></div>
      </div>
    </div>
  </section>
</template>
