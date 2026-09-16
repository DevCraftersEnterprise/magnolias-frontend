<script setup lang="ts">
definePageMeta({ layout: "admin", pageTitle: "Reparto" });
useHead({ title: "Reparto · Magnolias" });

import { ordersService } from "~/services/orders.service";
import type {
  OrderAvailableDeliveryOrder,
  OrderDeliveryAssignmentCard,
} from "~/types/order.types";
import { useToast } from "vue-toastification";

const { user } = useAuthUser();
const { selectedBranch } = useBranch();
const { canToggleViewAs, viewAsDriverId } = useViewAs();
const toast = useToast();

// Cliente: en vez de que el admin asigne el repartidor, se le muestran los
// pedidos disponibles de su sucursal y los toma él mismo.
const viewMode = ref<"mine" | "available">("mine");
const availableOrders = ref<OrderAvailableDeliveryOrder[]>([]);
const availableLoading = ref(false);
const claimingOrderId = ref("");

async function loadAvailableOrders() {
  availableLoading.value = true;
  try {
    availableOrders.value = await ordersService.getAvailableDeliveries();
  } catch (e: any) {
    toast.error(e?.message || "Error al cargar pedidos disponibles.");
  } finally {
    availableLoading.value = false;
  }
}

async function claimOrder(order: OrderAvailableDeliveryOrder) {
  if (claimingOrderId.value) return;
  claimingOrderId.value = order.id;
  try {
    await ordersService.claimDelivery(order.id);
    toast.success(`Tomaste el pedido ${order.orderCode}.`);
    await Promise.all([loadAvailableOrders(), loadAssignments()]);
  } catch (e: any) {
    toast.error(e?.message || "Este pedido ya fue tomado por otro repartidor.");
    await loadAvailableOrders();
  } finally {
    claimingOrderId.value = "";
  }
}

watch(viewMode, (mode) => {
  if (mode === "available" && availableOrders.value.length === 0) {
    loadAvailableOrders();
  }
});

// Un ADMIN/SUPER que "ve como repartidor" no es un repartidor real: la lista
// debe consultarse con el id elegido en el Topbar (viewAsDriverId), no con el
// id de la sesión actual (mismo patrón que el kanban de pastelero).
const driverId = computed(() =>
  canToggleViewAs.value ? viewAsDriverId.value : (user.value?.id ?? ""),
);

const loading = ref(true);
const assignments = ref<OrderDeliveryAssignmentCard[]>([]);

const deliverTarget = ref<OrderDeliveryAssignmentCard | null>(null);
const deliverConfirm = ref(false);
const delivering = ref(false);

const {
  tab: activeTab,
  rangeFrom,
  rangeTo,
  tomorrowLabel,
  dayAfterLabel,
  tomorrowItems: tomorrowAssignments,
  dayAfterItems: dayAfterAssignments,
  rangeItems: rangeAssignments,
  activeItems: activeAssignments,
} = useDeliveryDateTabs(assignments, (c) => c.order.deliveryDate);

async function loadAssignments() {
  if (!driverId.value) {
    assignments.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    assignments.value = await ordersService.getDriverAssignments(
      driverId.value,
    );
  } catch (e: any) {
    toast.error(e?.message || "Error al cargar tus entregas.");
  } finally {
    loading.value = false;
  }
}

function refresh() {
  loadAssignments();
}

function confirmDeliver(card: OrderDeliveryAssignmentCard) {
  deliverTarget.value = card;
  deliverConfirm.value = true;
}

async function executeDeliver() {
  if (!deliverTarget.value || delivering.value) return;
  delivering.value = true;
  try {
    await ordersService.markDelivered(deliverTarget.value.order.id);
    deliverConfirm.value = false;
    deliverTarget.value = null;
    await loadAssignments();
    toast.success("Pedido marcado como entregado.");
  } catch (e: any) {
    toast.error(e?.message || "No se pudo marcar como entregado.");
    deliverConfirm.value = false;
  } finally {
    delivering.value = false;
  }
}

function goToOrderDetail(card: OrderDeliveryAssignmentCard) {
  navigateTo("/admin/pedidos/detalle/" + card.order.id);
}

watch([driverId, selectedBranch], () => loadAssignments(), { immediate: true });
</script>

<template>
  <section class="min-h-[calc(100vh-86px)] bg-[#F3F3F4] font-sans">
    <div class="mx-auto w-full max-w-[1260px] px-4 py-6 lg:px-8 lg:py-8">
      <div
        class="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 overflow-hidden"
      >
        <div class="px-6 pt-5 flex gap-1 rounded-xl">
          <button
            type="button"
            class="px-4 py-2 text-[13px] font-semibold rounded-t-lg transition"
            :class="
              viewMode === 'mine'
                ? 'text-[#C9007C] border-b-2 border-[#C9007C]'
                : 'text-gray-400 hover:text-gray-600'
            "
            @click="viewMode = 'mine'"
          >
            Mis entregas
          </button>
          <button
            v-if="!canToggleViewAs"
            type="button"
            class="px-4 py-2 text-[13px] font-semibold rounded-t-lg transition"
            :class="
              viewMode === 'available'
                ? 'text-[#C9007C] border-b-2 border-[#C9007C]'
                : 'text-gray-400 hover:text-gray-600'
            "
            @click="viewMode = 'available'"
          >
            Disponibles
            <span v-if="availableOrders.length" class="opacity-60"
              >({{ availableOrders.length }})</span
            >
          </button>
        </div>

        <div v-if="viewMode === 'mine'" class="px-6 pt-5 pb-4 border-b border-black/[0.06]">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p
                class="text-[10px] font-bold tracking-widest text-gray-400 uppercase"
              >
                Mis entregas
              </p>
              <h2 class="mt-0.5 text-[18px] font-bold text-[#111827]">
                {{ selectedBranch?.name ?? "Reparto" }}
              </h2>
            </div>

            <div class="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
              <button
                class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                :class="
                  activeTab === 'tomorrow'
                    ? 'bg-white shadow-sm text-[#111827]'
                    : 'text-gray-400 hover:text-gray-600'
                "
                @click="activeTab = 'tomorrow'"
              >
                <span class="text-[12px] font-semibold leading-tight"
                  >Para mañana
                  <span class="font-normal opacity-60"
                    >({{ tomorrowAssignments.length }})</span
                  ></span
                >
                <span class="text-[11px] capitalize opacity-50 leading-tight">{{
                  tomorrowLabel
                }}</span>
              </button>
              <button
                class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                :class="
                  activeTab === 'dayAfter'
                    ? 'bg-white shadow-sm text-[#111827]'
                    : 'text-gray-400 hover:text-gray-600'
                "
                @click="activeTab = 'dayAfter'"
              >
                <span class="text-[12px] font-semibold leading-tight"
                  >Pasado mañana
                  <span class="font-normal opacity-60"
                    >({{ dayAfterAssignments.length }})</span
                  ></span
                >
                <span class="text-[11px] capitalize opacity-50 leading-tight">{{
                  dayAfterLabel
                }}</span>
              </button>
              <button
                class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                :class="
                  activeTab === 'all'
                    ? 'bg-white shadow-sm text-[#111827]'
                    : 'text-gray-400 hover:text-gray-600'
                "
                @click="activeTab = 'all'"
              >
                <span class="text-[12px] font-semibold leading-tight"
                  >Todas
                  <span class="font-normal opacity-60"
                    >({{ assignments.length }})</span
                  ></span
                >
                <span class="text-[11px] opacity-50 leading-tight">General</span>
              </button>
              <button
                class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                :class="
                  activeTab === 'range'
                    ? 'bg-white shadow-sm text-[#111827]'
                    : 'text-gray-400 hover:text-gray-600'
                "
                @click="activeTab = 'range'"
              >
                <span class="text-[12px] font-semibold leading-tight"
                  >Por rango
                  <span class="font-normal opacity-60"
                    >({{ rangeAssignments.length }})</span
                  ></span
                >
                <span class="text-[11px] opacity-50 leading-tight">Fechas</span>
              </button>
            </div>

            <button
              type="button"
              class="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 h-9 text-[13px] text-gray-500 hover:bg-gray-200 transition disabled:opacity-40 shrink-0"
              :disabled="loading"
              @click="refresh"
            >
              Actualizar
            </button>
          </div>

          <OrderDeliveryDateRangePicker
            v-model:from="rangeFrom"
            v-model:to="rangeTo"
            :visible="activeTab === 'range'"
          />
        </div>

        <template v-if="viewMode === 'mine'">
          <!-- ADMIN/SUPER en "ver como repartidor" sin elegir a quién previsualizar -->
          <div
            v-if="canToggleViewAs && !driverId"
            class="py-16 text-center text-[13px] text-gray-500"
          >
            Selecciona un repartidor en el aviso "Viendo como" (arriba) para
            previsualizar su lista de entregas.
          </div>

          <div v-else-if="loading" class="py-16 flex justify-center">
            <div
              class="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"
            ></div>
          </div>

          <div v-else class="p-4">
            <div
              v-if="activeAssignments.length === 0"
              class="py-12 text-center text-[13px] text-gray-400"
            >
              Sin entregas asignadas.
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="card in activeAssignments"
                :key="card.id"
                class="bg-white rounded-xl ring-1 ring-black/[0.07] overflow-hidden hover:ring-black/[0.14] hover:shadow-sm transition"
              >
                <button
                  type="button"
                  class="block w-full text-left cursor-pointer"
                  aria-label="Ver detalle del pedido"
                  @click="goToOrderDetail(card)"
                >
                  <div
                    class="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2"
                  >
                    <span
                      class="font-bold text-[13px] text-[#111827] leading-tight truncate"
                      >{{ card.order.orderCode ?? "—" }}</span
                    >
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 mt-0.5"
                      :style="{ ...getOrderTypeColor(card.order) }"
                      >{{ getOrderTypeLabel(card.order) }}</span
                    >
                  </div>
                  <div class="px-3.5 pb-3 space-y-1.5 text-[12px] text-gray-500">
                    <div
                      v-if="card.order.customer?.fullName"
                      class="flex items-center gap-1.5 truncate"
                    >
                      <span class="truncate">{{
                        card.order.customer.fullName
                      }}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      {{ formatDate(card.order.deliveryDate)
                      }}<span v-if="card.order.deliveryTime" class="text-gray-400">
                        · {{ card.order.deliveryTime }}</span
                      >
                    </div>
                    <span
                      class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                      :style="{
                        backgroundColor: STATUS_COLORS[card.order.status]?.bg ?? '#eee',
                        color: STATUS_COLORS[card.order.status]?.text ?? '#333',
                      }"
                      >{{ STATUS_LABELS[card.order.status] ?? card.order.status }}</span
                    >
                  </div>
                  <div v-if="card.order.deliveryAddress" class="px-3.5 pb-3">
                    <OrderDeliveryAddressSummary :address="card.order.deliveryAddress" />
                  </div>
                </button>
                <div class="border-t border-black/[0.06] px-3 py-2.5">
                  <button
                    class="w-full rounded-lg bg-green-50 py-1.5 text-[12px] font-semibold text-green-700 hover:bg-green-100 transition disabled:opacity-40"
                    :disabled="
                      card.order.status !== 'IN DELIVERY' ||
                      moneyToNumber(card.order.remainingBalance) > 0
                    "
                    :title="
                      card.order.status !== 'IN DELIVERY'
                        ? 'El pedido debe estar en proceso de entrega'
                        : moneyToNumber(card.order.remainingBalance) > 0
                          ? 'El pedido tiene saldo pendiente de pago'
                          : 'Marcar como entregado'
                    "
                    @click="confirmDeliver(card)"
                  >
                    Marcar como entregado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="px-6 pt-5 pb-4 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                Disponibles
              </p>
              <h2 class="mt-0.5 text-[18px] font-bold text-[#111827]">
                Pedidos listos para tomar
              </h2>
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 h-9 text-[13px] text-gray-500 hover:bg-gray-200 transition disabled:opacity-40 shrink-0"
              :disabled="availableLoading"
              @click="loadAvailableOrders"
            >
              Actualizar
            </button>
          </div>

          <div v-if="availableLoading" class="py-16 flex justify-center">
            <div
              class="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"
            ></div>
          </div>

          <div v-else class="p-4">
            <div
              v-if="availableOrders.length === 0"
              class="py-12 text-center text-[13px] text-gray-400"
            >
              No hay pedidos disponibles por ahora.
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="order in availableOrders"
                :key="order.id"
                class="bg-white rounded-xl ring-1 ring-black/[0.07] overflow-hidden hover:ring-black/[0.14] hover:shadow-sm transition"
              >
                <div class="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2">
                  <span class="font-bold text-[13px] text-[#111827] leading-tight truncate"
                    >{{ order.orderCode ?? "—" }}</span
                  >
                  <span
                    class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 mt-0.5"
                    :style="{ ...getOrderTypeColor(order) }"
                    >{{ getOrderTypeLabel(order) }}</span
                  >
                </div>
                <div class="px-3.5 pb-3 space-y-1.5 text-[12px] text-gray-500">
                  <div v-if="order.customer?.fullName" class="flex items-center gap-1.5 truncate">
                    <span class="truncate">{{ order.customer.fullName }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    {{ formatDate(order.deliveryDate)
                    }}<span v-if="order.deliveryTime" class="text-gray-400">
                      · {{ order.deliveryTime }}</span
                    >
                  </div>
                </div>
                <div v-if="order.deliveryAddress" class="px-3.5 pb-3">
                  <OrderDeliveryAddressSummary :address="order.deliveryAddress" />
                </div>
                <div class="border-t border-black/[0.06] px-3 py-2.5">
                  <button
                    type="button"
                    class="w-full rounded-lg bg-[#FFE1F1] py-1.5 text-[12px] font-semibold text-[#C9007C] hover:bg-[#FFCCE7] transition disabled:opacity-40"
                    :disabled="claimingOrderId === order.id"
                    @click="claimOrder(order)"
                  >
                    Tomar pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <UiConfirmModal
      v-model="deliverConfirm"
      title="Marcar como entregado"
      :message="`¿Confirmas que el pedido ${deliverTarget?.order.orderCode ?? ''} fue entregado?`"
      @confirm="executeDeliver"
    />
  </section>
</template>
