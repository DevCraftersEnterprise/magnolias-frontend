<script setup lang="ts">
definePageMeta({ layout: "admin", pageTitle: "Pedidos" });
useHead({ title: "Pedidos · Magnolias" });

import { ordersService } from "~/services/orders.service";
import type {
  OrderDetailAssignmentCard,
  OrderDetailProductionStatus,
  OrderItem,
  OrderStatus,
} from "~/types/order.types";
import { useToast } from "vue-toastification";

const { user } = useAuthUser();
const { selectedBranch } = useBranch();
const { effectiveRole, canToggleViewAs, viewAsBakerId } = useViewAs();

const isBaker = computed(() => effectiveRole.value === "BAKER");
const toast = useToast();

// Un ADMIN/SUPER que "ve como pastelero" no es un pastelero real: el kanban
// debe consultarse con el id del pastelero elegido en el Topbar (viewAsBakerId),
// no con el id de la sesión actual (que siempre sería el del admin y nunca
// tendría asignaciones propias).
const kanbanBakerId = computed(() =>
  canToggleViewAs.value ? viewAsBakerId.value : (user.value?.id ?? ""),
);

// ─── Helpers ────────────────────────────────────────────────────────────────
function typeColor(o: { isEvento?: boolean; isEnTienda?: boolean }) {
  return getOrderTypeColor(o);
}
function typeLabel(o: { isEvento?: boolean; isEnTienda?: boolean }) {
  return getOrderTypeLabel(o);
}

// ─── TABLE STATE ─────────────────────────────────────────────────────────────
const loading = ref(true);
const orders = ref<OrderItem[]>([]);

const filterStatus = ref<OrderStatus | "">("");

const {
  query: nameQuery,
  debouncedQuery: debouncedName,
  clear: clearSearch,
} = useDebounceSearch(() => loadOrders(true));

const {
  pagination,
  update: paginationUpdate,
  reset: paginationReset,
  canPrev,
  canNext,
  showingFrom,
  showingTo,
  prevPage,
  nextPage,
} = usePagination(loadOrders, 15);

const showPagination = computed(
  () => !loading.value && (canPrev.value || canNext.value),
);

const cancelTarget = ref<OrderItem | null>(null);
const cancelConfirm = ref(false);
const canceling = ref(false);
const cancelReason = ref("");

const deliverTarget = ref<OrderItem | null>(null);
const deliverConfirm = ref(false);
const delivering = ref(false);

// ─── Autoría de empleado (cuenta compartida de sucursal) ──────────────────────
const isEmployeeSession = computed(() => user.value?.role === "EMPLOYEE");
const {
  modalOpen: employeePinModalOpen,
  loading: employeePinLoading,
  error: employeePinError,
  employeeActionToken,
  openModal: openEmployeePinModal,
  verifyPin: verifyEmployeePin,
  reset: resetEmployeePin,
} = useEmployeePin();

type PendingEmployeeAction = "deliver" | "cancel" | null;
const pendingEmployeeAction = ref<PendingEmployeeAction>(null);
const employeePinActionLabel = computed(() =>
  pendingEmployeeAction.value === "cancel"
    ? "cancelar el pedido"
    : "marcar el pedido como entregado",
);

async function onEmployeePinSubmit(pin: string) {
  const ok = await verifyEmployeePin(pin);
  if (!ok) return;
  if (pendingEmployeeAction.value === "deliver") await executeDeliver();
  else if (pendingEmployeeAction.value === "cancel") await executeCancel();
  pendingEmployeeAction.value = null;
}

function confirmDeliver(order: OrderItem) {
  deliverTarget.value = order;
  deliverConfirm.value = true;
}

async function executeDeliver() {
  if (!deliverTarget.value || delivering.value) return;

  if (isEmployeeSession.value && !employeeActionToken.value) {
    pendingEmployeeAction.value = "deliver";
    openEmployeePinModal();
    return;
  }

  delivering.value = true;
  // Token de un solo uso: se consume aquí para que la siguiente acción (en
  // este mismo pedido u otro) vuelva a pedir el PIN, en vez de asumir que
  // sigue siendo el mismo compañero frente al mostrador.
  const actionToken = employeeActionToken.value || undefined;
  if (isEmployeeSession.value) resetEmployeePin();
  try {
    await ordersService.markDelivered(deliverTarget.value.id, actionToken);
    deliverConfirm.value = false;
    deliverTarget.value = null;
    await loadOrders(true);
    toast.success("Pedido marcado como entregado.");
  } catch (e: any) {
    toast.error(e?.message || "No se pudo marcar como entregado.");
    deliverConfirm.value = false;
  } finally {
    delivering.value = false;
  }
}

// ─── ASSIGNMENT (Cliente #11) ───────────────────────────────────────────────
// La asignación real ahora es por línea de producto y vive en DetailModal.vue
// (se abre desde "Ver detalle" en cada tarjeta); aquí solo se muestra un
// resumen liviano (assignedBakersCount/totalLinesCount) por pedido.

async function loadOrders(reset = false) {
  if (isBaker.value) return;
  if (!selectedBranch.value?.id) {
    orders.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    if (reset) {
      paginationReset();
      orders.value = [];
    }
    const data = await ordersService.getOrders(selectedBranch.value.id, {
      orderStatus: filterStatus.value || undefined,
      name: debouncedName.value || undefined,
      limit: pagination.value.limit,
      offset: pagination.value.offset,
    });
    orders.value = data.items ?? [];
    paginationUpdate(data.pagination, data.total);
  } catch (e: any) {
    toast.error(e?.message || "Error al cargar pedidos.");
  } finally {
    loading.value = false;
  }
}

function confirmCancel(order: OrderItem) {
  cancelTarget.value = order;
  cancelReason.value = "";
  cancelConfirm.value = true;
}

async function executeCancel() {
  if (!cancelTarget.value || canceling.value) return;

  if (isEmployeeSession.value && !employeeActionToken.value) {
    pendingEmployeeAction.value = "cancel";
    openEmployeePinModal();
    return;
  }

  canceling.value = true;
  // Token de un solo uso: ver nota equivalente en executeDeliver.
  const actionToken = employeeActionToken.value || undefined;
  if (isEmployeeSession.value) resetEmployeePin();
  try {
    await ordersService.cancelOrder(
      cancelTarget.value.id,
      cancelReason.value,
      actionToken,
    );
    cancelConfirm.value = false;
    cancelTarget.value = null;
    cancelReason.value = "";
    await loadOrders(true);
    toast.success("Pedido cancelado.");
  } catch (e: any) {
    toast.error(e?.message || "No se pudo cancelar el pedido.");
    cancelConfirm.value = false;
  } finally {
    canceling.value = false;
  }
}

// ─── Kanban state ───────────────────────────────────────────────────────────
type KanbanTab = "tomorrow" | "dayAfter" | "all" | "range";
const PRODUCTION_STATUS_LABELS: Record<OrderDetailProductionStatus, string> = {
  PENDING: "Pendiente",
  IN_PROCESS: "En proceso",
  DONE: "Listo",
};
const kanbanTab = ref<KanbanTab>("tomorrow");
const kanbanLoading = ref(true);
const kanbanAssignments = ref<OrderDetailAssignmentCard[]>([]);
const updatingId = ref<string | null>(null);
const rangeFrom = ref("");
const rangeTo = ref("");

const tomorrowStr = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoDate(d);
});

const dayAfterStr = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return isoDate(d);
});

const tomorrowLabel = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
});

const dayAfterLabel = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
});

// Filtra por fecha de entrega (comparando solo la parte de fecha del ISO)
function deliveryDateStr(iso: string) {
  if (!iso) return "";
  return iso.split("T")[0];
}

// Cliente #11: el kanban ahora es por línea de producto asignada, no por
// pedido completo - un solo fetch (getBakerDetailAssignments) trae todas las
// líneas activas del repostero y las 4 pestañas (mañana/pasado/todas/rango)
// son simples filtros locales sobre ese mismo arreglo.
const tomorrowAssignments = computed(() =>
  kanbanAssignments.value.filter(
    (c) =>
      deliveryDateStr(c.orderDetail.order.deliveryDate) === tomorrowStr.value,
  ),
);
const dayAfterAssignments = computed(() =>
  kanbanAssignments.value.filter(
    (c) =>
      deliveryDateStr(c.orderDetail.order.deliveryDate) === dayAfterStr.value,
  ),
);

const rangeError = computed(() => {
  if (rangeFrom.value && rangeTo.value && rangeTo.value < rangeFrom.value)
    return "La fecha de término no puede ser menor a la fecha de inicio.";
  return "";
});

watch(rangeError, (newVal, oldVal) => {
  if (newVal && !oldVal) toast.error(newVal);
});

const rangeAssignments = computed(() => {
  if (rangeError.value) return [];
  if (!rangeFrom.value && !rangeTo.value) return [];
  return kanbanAssignments.value.filter((c) => {
    const d = deliveryDateStr(c.orderDetail.order.deliveryDate);
    if (rangeFrom.value && d < rangeFrom.value) return false;
    if (rangeTo.value && d > rangeTo.value) return false;
    return true;
  });
});

const activeKanbanAssignments = computed(() => {
  switch (kanbanTab.value) {
    case "tomorrow":
      return tomorrowAssignments.value;
    case "dayAfter":
      return dayAfterAssignments.value;
    case "all":
      return kanbanAssignments.value;
    case "range":
      return rangeAssignments.value;
    default:
      return tomorrowAssignments.value;
  }
});

function lineStatus(card: OrderDetailAssignmentCard): OrderDetailProductionStatus {
  return card.orderDetail.productionStatus ?? "PENDING";
}

const pendingLines = computed(() =>
  activeKanbanAssignments.value.filter((c) => lineStatus(c) === "PENDING"),
);
const inProcessLines = computed(() =>
  activeKanbanAssignments.value.filter((c) => lineStatus(c) === "IN_PROCESS"),
);
const doneLines = computed(() =>
  activeKanbanAssignments.value.filter((c) => lineStatus(c) === "DONE"),
);

async function loadKanbanOrders() {
  if (!isBaker.value) return;
  if (!kanbanBakerId.value) {
    kanbanAssignments.value = [];
    kanbanLoading.value = false;
    return;
  }
  kanbanLoading.value = true;
  try {
    const data = await ordersService.getBakerDetailAssignments(
      kanbanBakerId.value,
    );
    kanbanAssignments.value = (data ?? []).filter(
      (c) =>
        c.orderDetail.order.status !== "DELIVERED" &&
        c.orderDetail.order.status !== "CANCELED",
    );
  } catch (e: any) {
    toast.error(e?.message || "Error al cargar pedidos.");
  } finally {
    kanbanLoading.value = false;
  }
}

function nextLineStatus(
  status: OrderDetailProductionStatus,
): OrderDetailProductionStatus {
  return status === "PENDING" ? "IN_PROCESS" : "DONE";
}

async function advanceStatus(card: OrderDetailAssignmentCard) {
  if (updatingId.value) return;
  updatingId.value = card.orderDetail.id;
  try {
    const next = nextLineStatus(lineStatus(card));
    const updated = await ordersService.updateDetailProductionStatus(
      card.orderDetail.id,
      next,
    );
    card.orderDetail.productionStatus = updated.productionStatus ?? next;
    if (updated.order?.status) card.orderDetail.order.status = updated.order.status;
    toast.success(
      next === "DONE" ? "Línea marcada como lista." : "Producción iniciada.",
    );
  } catch (e: any) {
    console.error("Error actualizando estado:", e);
    toast.error(e?.message || "No se pudo actualizar el estado.");
  } finally {
    updatingId.value = null;
  }
}

function refreshKanban() {
  loadKanbanOrders();
}

// ─── Kanban confirm modal ───────────────────────────────────────────────────
const kanbanConfirmTarget = ref<OrderDetailAssignmentCard | null>(null);
function requestAdvanceStatus(card: OrderDetailAssignmentCard) {
  if (updatingId.value) return;
  kanbanConfirmTarget.value = card;
}
async function confirmAdvanceStatus() {
  const card = kanbanConfirmTarget.value;
  kanbanConfirmTarget.value = null;
  if (!card) return;
  await advanceStatus(card);
}

// ─── Lifecycle & watchers ─────────────────────────────────────────────────────
// isBaker puede cambiar sin que la ruta cambie (toggle "ver como pastelero"
// estando ya en /admin/pedidos), por eso se observa de forma reactiva en vez
// de solo cargar datos en onMounted.
watch(
  [isBaker, kanbanBakerId],
  () => {
    if (isBaker.value) loadKanbanOrders();
    else loadOrders(true);
  },
  { immediate: true },
);

watch(selectedBranch, () => {
  if (isBaker.value) loadKanbanOrders();
  else loadOrders(true);
});

watch([filterStatus, debouncedName], () => loadOrders(true));

// ─── Order detail modal ───────────────────────────────────────────────────────
const selectedOrder = ref<OrderItem | null>(null);
const detailOpen = ref(false);

function openDetail(order: OrderItem) {
  selectedOrder.value = order;
  detailOpen.value = true;
}

function onOrderPaymentUpdated(payload: {
  id: string;
  remainingBalance: string;
}) {
  const idx = orders.value.findIndex((o) => o.id === payload.id);
  if (idx !== -1)
    orders.value[idx] = {
      ...orders.value[idx],
      remainingBalance: payload.remainingBalance,
    } as OrderItem;
  if (selectedOrder.value?.id === payload.id) {
    selectedOrder.value = {
      ...selectedOrder.value,
      remainingBalance: payload.remainingBalance,
    };
  }
}
</script>

<template>
  <section class="min-h-[calc(100vh-86px)] bg-[#F3F3F4] font-sans">
    <div class="mx-auto w-full max-w-[1260px] px-4 py-6 lg:px-8 lg:py-8">
      <!-- ================================================================ -->
      <!-- VISTA TABLA — admin / employee / assistant                        -->
      <!-- ================================================================ -->
      <template v-if="!isBaker">
        <div
          class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden"
        >
          <!-- Header: título + buscador + filtros -->
          <div class="px-6 py-5 border-b border-black/10">
            <div class="flex flex-wrap items-center gap-3">
              <!-- Título + botón nuevo -->
              <div class="flex items-center gap-2">
                <h2 class="text-[20px] font-semibold text-[#111827]">
                  Pedidos Registrados
                </h2>
                <button
                  type="button"
                  class="grid h-9 w-9 place-items-center rounded-xl bg-white ring-1 ring-black/10 text-[#111827] hover:bg-black/5 transition"
                  title="Nuevo pedido"
                  @click="navigateTo('/admin/pedidos/crear')"
                >
                  <span class="text-[18px] leading-none">+</span>
                </button>
                <button
                  type="button"
                  class="grid h-9 w-9 place-items-center rounded-xl bg-white ring-1 ring-black/10 text-[#111827] hover:bg-black/5 transition disabled:opacity-40"
                  title="Actualizar"
                  aria-label="Actualizar lista de pedidos"
                  :disabled="loading"
                  @click="loadOrders(false)"
                >
                  <svg
                    class="h-4 w-4"
                    :class="{ 'animate-spin': loading }"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path
                      d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                    />
                  </svg>
                </button>
              </div>

              <!-- Buscador por nombre (móvil + web) -->
              <AdminSearchInput
                v-model="nameQuery"
                placeholder="Buscar por nombre del cliente"
                class="relative w-full sm:flex-1 sm:min-w-[180px]"
                @clear="clearSearch"
              />

              <!-- Filtro de estado -->
              <div class="relative w-full sm:w-auto">
                <select
                  v-model="filterStatus"
                  class="h-10 w-full sm:w-auto appearance-none rounded-xl bg-white pl-3 pr-9 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 cursor-pointer"
                >
                  <option value="">Estado: Todos</option>
                  <option value="CREATED">Creado</option>
                  <option value="IN PROCESS">En proceso</option>
                  <option value="DONE">Finalizado</option>
                  <option value="DELIVERED">Entregado</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
                <svg
                  class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <!-- Sin sucursal seleccionada -->
            <div
              v-if="!selectedBranch"
              class="py-14 text-center text-[13px] text-gray-400"
            >
              Selecciona una sucursal en el menú superior para ver sus pedidos.
            </div>

            <template v-else>
              <!-- Loading -->
              <div v-if="loading" class="py-14 text-center">
                <div
                  class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"
                ></div>
              </div>

              <!-- Desktop: Tabla -->
              <div v-else>
                <div
                  class="hidden sm:block rounded-xl ring-1 ring-black/10 overflow-hidden"
                >
                  <div class="overflow-x-auto">
                    <table class="min-w-full text-left">
                      <thead class="bg-[#FAFAFA] border-b border-black/10">
                        <tr>
                          <th
                            class="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap"
                          >
                            Folio
                          </th>
                          <th
                            class="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap"
                          >
                            Cliente
                          </th>
                          <th
                            class="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap"
                          >
                            Pastelero
                          </th>
                          <th
                            class="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap"
                          >
                            Fecha de entrega
                          </th>
                          <th
                            class="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap"
                          >
                            Hora
                          </th>
                          <th
                            class="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap"
                          >
                            Total
                          </th>
                          <th
                            class="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap"
                          >
                            Estado
                          </th>
                          <th class="px-4 py-3 w-12"></th>
                        </tr>
                      </thead>

                      <tbody>
                        <!-- Vacío -->
                        <tr v-if="orders.length === 0">
                          <td
                            colspan="8"
                            class="px-4 py-12 text-center text-[13px] text-gray-400"
                          >
                            No hay pedidos registrados para esta sucursal.
                          </td>
                        </tr>

                        <!-- Filas -->
                        <tr
                          v-for="order in orders"
                          :key="order.id"
                          class="border-b border-black/5 last:border-b-0 hover:bg-[#FAFAFB] transition cursor-pointer"
                          @dblclick="openDetail(order)"
                        >
                          <!-- Folio / código -->
                          <td
                            class="px-4 py-3 text-[12px] font-semibold text-[#111827] whitespace-nowrap"
                          >
                            {{ order.orderCode ?? "—" }}
                          </td>

                          <!-- Cliente -->
                          <td
                            class="px-4 py-3 text-[13px] text-[#111827] whitespace-nowrap"
                          >
                            {{ order.customer?.fullName ?? "—" }}
                          </td>

                          <!-- Asignado a (resumen por línea, Cliente #11) -->
                          <td class="px-4 py-3 whitespace-nowrap">
                            <span
                              v-if="(order.totalLinesCount ?? 0) > 0"
                              class="text-[13px] font-medium"
                              :class="
                                (order.assignedBakersCount ?? 0) ===
                                order.totalLinesCount
                                  ? 'text-[#111827]'
                                  : 'text-gray-500'
                              "
                            >
                              {{ order.assignedBakersCount ?? 0 }}/{{
                                order.totalLinesCount
                              }}
                              asignadas
                            </span>
                            <span
                              v-else
                              class="text-[12px] text-gray-400 italic"
                              >Sin asignar</span
                            >
                          </td>

                          <!-- Fecha -->
                          <td
                            class="px-4 py-3 text-[13px] text-[#111827] whitespace-nowrap"
                          >
                            {{ formatDate(order.deliveryDate) }}
                          </td>

                          <!-- Hora -->
                          <td
                            class="px-4 py-3 text-[13px] text-[#111827] whitespace-nowrap"
                          >
                            {{ order.deliveryTime ?? "—" }}
                          </td>

                          <!-- Total -->
                          <td
                            class="px-4 py-3 text-[13px] font-medium text-[#111827] whitespace-nowrap"
                          >
                            {{ order.totalAmount ?? "—" }}
                          </td>

                          <!-- Estado (badge) -->
                          <td class="px-4 py-3">
                            <span
                              class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
                              :style="{
                                backgroundColor:
                                  STATUS_COLORS[order.status]?.bg ?? '#eee',
                                color:
                                  STATUS_COLORS[order.status]?.text ?? '#333',
                              }"
                            >
                              {{ STATUS_LABELS[order.status] ?? order.status }}
                            </span>
                          </td>

                          <!-- Acciones -->
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-0.5">
                              <!-- Ver detalle -->
                              <button
                                type="button"
                                class="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-black/5 hover:text-[#111827] transition"
                                title="Ver detalle"
                                @click="openDetail(order)"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  class="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                >
                                  <path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                  />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </button>
                              <!-- Editar (solo CREATED) -->
                              <button
                                type="button"
                                class="grid h-8 w-8 place-items-center rounded-lg transition"
                                :class="
                                  order.status === 'CREATED'
                                    ? 'text-gray-400 hover:bg-black/5 hover:text-[#111827]'
                                    : 'text-gray-200 cursor-not-allowed'
                                "
                                :title="
                                  order.status === 'CREATED'
                                    ? 'Editar pedido'
                                    : 'Solo se pueden editar pedidos con estado Creado'
                                "
                                :disabled="order.status !== 'CREATED'"
                                @click="
                                  order.status === 'CREATED' &&
                                  navigateTo(
                                    '/admin/pedidos/editar/' + order.id,
                                  )
                                "
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  class="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                >
                                  <path
                                    d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7"
                                  />
                                  <path
                                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                  />
                                </svg>
                              </button>
                              <!-- Asignar reposteros por línea (Cliente #11) -->
                              <button
                                type="button"
                                class="grid h-8 w-8 place-items-center rounded-lg transition"
                                :class="
                                  ['DELIVERED', 'CANCELED'].includes(
                                    order.status,
                                  )
                                    ? 'text-gray-200 cursor-not-allowed'
                                    : 'text-gray-400 hover:bg-purple-50 hover:text-[#7C00C9]'
                                "
                                :title="
                                  ['DELIVERED', 'CANCELED'].includes(
                                    order.status,
                                  )
                                    ? 'No se puede asignar en este estado'
                                    : 'Asignar reposteros por línea'
                                "
                                :disabled="
                                  ['DELIVERED', 'CANCELED'].includes(
                                    order.status,
                                  )
                                "
                                @click.stop="
                                  !['DELIVERED', 'CANCELED'].includes(
                                    order.status,
                                  ) && openDetail(order)
                                "
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  class="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                  <path
                                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                                  />
                                  <circle cx="9" cy="7" r="4" />
                                  <line x1="19" y1="8" x2="19" y2="14" />
                                  <line x1="22" y1="11" x2="16" y2="11" />
                                </svg>
                              </button>
                              <!-- Marcar como entregado (solo DONE + saldo en cero) -->
                              <button
                                type="button"
                                class="grid h-8 w-8 place-items-center rounded-lg transition"
                                :class="
                                  order.status === 'DONE' &&
                                  parseFloat(
                                    (order.remainingBalance ?? '0').replace(
                                      /[^0-9.-]/g,
                                      '',
                                    ),
                                  ) <= 0
                                    ? 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                                    : 'text-gray-200 cursor-not-allowed'
                                "
                                :title="
                                  order.status !== 'DONE'
                                    ? 'Solo se pueden entregar pedidos listos'
                                    : parseFloat(
                                          (
                                            order.remainingBalance ?? '0'
                                          ).replace(/[^0-9.-]/g, ''),
                                        ) > 0
                                      ? 'El pedido tiene saldo pendiente de pago'
                                      : 'Marcar como entregado'
                                "
                                :disabled="
                                  order.status !== 'DONE' ||
                                  parseFloat(
                                    (order.remainingBalance ?? '0').replace(
                                      /[^0-9.-]/g,
                                      '',
                                    ),
                                  ) > 0
                                "
                                @click="
                                  order.status === 'DONE' &&
                                  parseFloat(
                                    (order.remainingBalance ?? '0').replace(
                                      /[^0-9.-]/g,
                                      '',
                                    ),
                                  ) <= 0 &&
                                  confirmDeliver(order)
                                "
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  class="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                >
                                  <path
                                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                                  />
                                  <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                              </button>
                              <!-- Cancelar pedido -->
                              <button
                                type="button"
                                class="grid h-8 w-8 place-items-center rounded-lg transition"
                                :class="
                                  ['DELIVERED', 'CANCELED'].includes(
                                    order.status,
                                  )
                                    ? 'text-gray-200 cursor-not-allowed'
                                    : 'text-gray-400 hover:bg-orange-50 hover:text-orange-500'
                                "
                                :title="
                                  ['DELIVERED', 'CANCELED'].includes(
                                    order.status,
                                  )
                                    ? 'No se puede cancelar un pedido entregado o ya cancelado'
                                    : 'Cancelar pedido'
                                "
                                :disabled="
                                  ['DELIVERED', 'CANCELED'].includes(
                                    order.status,
                                  )
                                "
                                @click="
                                  !['DELIVERED', 'CANCELED'].includes(
                                    order.status,
                                  ) && confirmCancel(order)
                                "
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  class="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line
                                    x1="15"
                                    y1="9"
                                    x2="9"
                                    y2="15"
                                    stroke-linecap="round"
                                  />
                                  <line
                                    x1="9"
                                    y1="9"
                                    x2="15"
                                    y2="15"
                                    stroke-linecap="round"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Móvil: cards (< sm) -->
                <div class="sm:hidden space-y-3">
                  <div
                    v-for="order in orders"
                    :key="order.id"
                    class="rounded-2xl bg-white ring-1 ring-black/10 p-4 cursor-pointer active:scale-[0.99] transition"
                    role="button"
                    tabindex="0"
                    @click="openDetail(order)"
                  >
                    <!-- Top: folio + estado -->
                    <div class="flex items-start justify-between gap-2">
                      <span class="text-[14px] font-semibold text-[#111827]">{{
                        order.orderCode ?? "—"
                      }}</span>
                      <span
                        class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shrink-0"
                        :style="{
                          backgroundColor:
                            STATUS_COLORS[order.status]?.bg ?? '#eee',
                          color: STATUS_COLORS[order.status]?.text ?? '#333',
                        }"
                      >
                        {{ STATUS_LABELS[order.status] ?? order.status }}
                      </span>
                    </div>

                    <!-- Cliente -->
                    <p class="mt-1 text-[13px] text-gray-600">
                      {{ order.customer?.fullName ?? "—" }}
                    </p>

                    <!-- Fecha + Hora + Tipo + Total -->
                    <div
                      class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]"
                    >
                      <div>
                        <p class="text-gray-400">Fecha entrega</p>
                        <p class="text-[#111827]">
                          {{ formatDate(order.deliveryDate) }}
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-400">Hora</p>
                        <p class="text-[#111827]">
                          {{ order.deliveryTime ?? "—" }}
                        </p>
                      </div>
                      <div>
                        <p class="text-gray-400">Asignado a</p>
                        <p
                          v-if="(order.totalLinesCount ?? 0) > 0"
                          class="text-[#111827] font-medium truncate"
                        >
                          {{ order.assignedBakersCount ?? 0 }}/{{
                            order.totalLinesCount
                          }}
                          asignadas
                        </p>
                        <p v-else class="text-gray-400 italic">Sin asignar</p>
                      </div>
                      <div>
                        <p class="text-gray-400">Total</p>
                        <p class="text-[#111827] font-medium">
                          {{ order.totalAmount ?? "—" }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Vacío -->
                  <div
                    v-if="orders.length === 0"
                    class="rounded-2xl bg-white ring-1 ring-black/10 p-8 text-center text-[13px] text-gray-400"
                  >
                    No hay pedidos registrados para esta sucursal.
                  </div>
                </div>
              </div>
              <!-- /desktop+mobile -->

              <!-- Paginación: solo cuando hay más de una página -->
              <div
                v-if="showPagination"
                class="mt-4 flex flex-wrap items-center justify-between gap-3 text-[13px] text-gray-500"
              >
                <span
                  >Mostrando {{ showingFrom(orders.length) }}–{{
                    showingTo(orders.length)
                  }}
                  de {{ pagination.total }}</span
                >
                <div class="flex gap-2">
                  <button
                    class="h-8 px-3 rounded-lg ring-1 ring-black/10 bg-white hover:bg-black/5 disabled:opacity-40 transition text-[13px]"
                    :disabled="!canPrev"
                    @click="prevPage"
                  >
                    Anterior
                  </button>
                  <button
                    class="h-8 px-3 rounded-lg ring-1 ring-black/10 bg-white hover:bg-black/5 disabled:opacity-40 transition text-[13px]"
                    :disabled="!canNext"
                    @click="nextPage"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>

      <!-- ================================================================ -->
      <!-- VISTA KANBAN — pasteleros (BAKER)                                 -->
      <!-- ================================================================ -->
      <template v-else>
        <!-- Sin sucursal -->
        <div
          v-if="!selectedBranch"
          class="py-14 text-center text-[13px] text-gray-400"
        >
          Selecciona una sucursal en el menú superior para ver tus pedidos.
        </div>

        <template v-else>
          <!-- Contenedor blanco principal -->
          <div
            class="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 overflow-hidden"
          >
            <!-- ── Topbar del tablero ── -->
            <div class="px-6 pt-5 pb-4 border-b border-black/[0.06]">
              <!-- Fila 1: título + tabs + actualizar -->
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p
                    class="text-[10px] font-bold tracking-widest text-gray-400 uppercase"
                  >
                    Tablero de producción
                  </p>
                  <h2 class="mt-0.5 text-[18px] font-bold text-[#111827]">
                    {{ selectedBranch.name }}
                  </h2>
                </div>

                <!-- Tabs -->
                <div class="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
                  <button
                    class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                    :class="
                      kanbanTab === 'tomorrow'
                        ? 'bg-white shadow-sm text-[#111827]'
                        : 'text-gray-400 hover:text-gray-600'
                    "
                    @click="kanbanTab = 'tomorrow'"
                  >
                    <span class="text-[12px] font-semibold leading-tight"
                      >Para mañana
                      <span class="font-normal opacity-60"
                        >({{ tomorrowAssignments.length }})</span
                      ></span
                    >
                    <span
                      class="text-[11px] capitalize opacity-50 leading-tight"
                      >{{ tomorrowLabel }}</span
                    >
                  </button>
                  <button
                    class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                    :class="
                      kanbanTab === 'dayAfter'
                        ? 'bg-white shadow-sm text-[#111827]'
                        : 'text-gray-400 hover:text-gray-600'
                    "
                    @click="kanbanTab = 'dayAfter'"
                  >
                    <span class="text-[12px] font-semibold leading-tight"
                      >Pasado mañana
                      <span class="font-normal opacity-60"
                        >({{ dayAfterAssignments.length }})</span
                      ></span
                    >
                    <span
                      class="text-[11px] capitalize opacity-50 leading-tight"
                      >{{ dayAfterLabel }}</span
                    >
                  </button>
                  <button
                    class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                    :class="
                      kanbanTab === 'all'
                        ? 'bg-white shadow-sm text-[#111827]'
                        : 'text-gray-400 hover:text-gray-600'
                    "
                    @click="kanbanTab = 'all'"
                  >
                    <span class="text-[12px] font-semibold leading-tight"
                      >Todos
                      <span class="font-normal opacity-60"
                        >({{ kanbanAssignments.length }})</span
                      ></span
                    >
                    <span class="text-[11px] opacity-50 leading-tight"
                      >General</span
                    >
                  </button>
                  <button
                    class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                    :class="
                      kanbanTab === 'range'
                        ? 'bg-white shadow-sm text-[#111827]'
                        : 'text-gray-400 hover:text-gray-600'
                    "
                    @click="kanbanTab = 'range'"
                  >
                    <span class="text-[12px] font-semibold leading-tight"
                      >Por rango
                      <span class="font-normal opacity-60"
                        >({{ rangeAssignments.length }})</span
                      ></span
                    >
                    <span class="text-[11px] opacity-50 leading-tight"
                      >Fechas</span
                    >
                  </button>
                </div>

                <!-- Actualizar -->
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 h-9 text-[13px] text-gray-500 hover:bg-gray-200 transition disabled:opacity-40 shrink-0"
                  :disabled="kanbanLoading"
                  @click="refreshKanban"
                >
                  <svg
                    class="h-3.5 w-3.5"
                    :class="{ 'animate-spin': kanbanLoading }"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M23 4v6h-6" />
                    <path d="M1 20v-6h6" />
                    <path
                      d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
                    />
                  </svg>
                  Actualizar
                </button>
              </div>

              <!-- Fila 2: date range picker (no afecta el layout de arriba) -->
              <Transition
                enter-active-class="transition duration-150"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div
                  v-if="kanbanTab === 'range'"
                  class="mt-3 flex flex-wrap items-center gap-2"
                >
                  <div class="flex items-center gap-1.5">
                    <label
                      class="text-[11px] font-semibold text-gray-400 whitespace-nowrap"
                      >Desde</label
                    >
                    <input
                      v-model="rangeFrom"
                      type="date"
                      class="rounded-lg border border-black/10 bg-gray-50 px-3 py-1.5 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#C9007C]/30"
                    />
                  </div>
                  <div class="flex items-center gap-1.5">
                    <label
                      class="text-[11px] font-semibold text-gray-400 whitespace-nowrap"
                      >Hasta</label
                    >
                    <input
                      v-model="rangeTo"
                      type="date"
                      class="rounded-lg border border-black/10 bg-gray-50 px-3 py-1.5 text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#C9007C]/30"
                    />
                  </div>
                  <button
                    v-if="rangeFrom || rangeTo"
                    type="button"
                    class="rounded-lg bg-gray-100 px-3 py-1.5 text-[12px] text-gray-500 hover:bg-gray-200 transition"
                    @click="
                      rangeFrom = '';
                      rangeTo = '';
                    "
                  >
                    Limpiar
                  </button>
                  <!-- Validation error removed: now shown via toast -->
                </div>
              </Transition>
            </div>

            <!-- ADMIN/SUPER en "ver como pastelero" sin elegir a quién previsualizar -->
            <div
              v-if="canToggleViewAs && !kanbanBakerId"
              class="py-16 text-center text-[13px] text-gray-500"
            >
              Selecciona un pastelero en el aviso "Viendo como" (arriba) para
              previsualizar su tablero.
            </div>

            <!-- Loading -->
            <div v-else-if="kanbanLoading" class="py-16 flex justify-center">
              <div
                class="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"
              ></div>
            </div>

            <!-- ── Columnas ── -->
            <div
              v-else
              class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06]"
            >
              <!-- Pendientes (CREATED) -->
              <div class="flex flex-col">
                <div
                  class="px-4 py-3 flex items-center gap-2 border-b border-black/[0.06]"
                >
                  <span
                    class="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0"
                  ></span>
                  <span class="text-[13px] font-semibold text-[#111827]"
                    >Pendientes</span
                  >
                  <span
                    class="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700"
                    >{{ pendingLines.length }}</span
                  >
                </div>
                <div class="bg-gray-50/60 p-3 space-y-2.5 min-h-[260px] flex-1">
                  <div
                    v-for="card in pendingLines"
                    :key="card.orderDetail.id"
                    class="bg-white rounded-xl ring-1 ring-black/[0.07] overflow-hidden cursor-pointer hover:ring-black/[0.14] hover:shadow-sm transition"
                    @click="
                      navigateTo(
                        '/admin/pedidos/detalle/' + card.orderDetail.order.id,
                      )
                    "
                  >
                    <div class="h-1 bg-amber-400"></div>
                    <div
                      class="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2"
                    >
                      <span
                        class="font-bold text-[13px] text-[#111827] leading-tight truncate"
                        >{{ card.orderDetail.order.orderCode ?? "—" }}</span
                      >
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 mt-0.5"
                        :style="{ ...typeColor(card.orderDetail.order) }"
                        >{{ typeLabel(card.orderDetail.order) }}</span
                      >
                    </div>
                    <div
                      class="px-3.5 pb-3 space-y-1.5 text-[12px] text-gray-500"
                    >
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
                        }}<span
                          v-if="card.orderDetail.order.deliveryTime"
                          class="text-gray-400"
                        >
                          · {{ card.orderDetail.order.deliveryTime }}</span
                        >
                      </div>
                      <div
                        v-if="
                          card.orderDetail.order.remainingBalance &&
                          parseFloat(
                            String(card.orderDetail.order.remainingBalance),
                          ) > 0
                        "
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
                    </div>
                    <div
                      class="border-t border-black/[0.06] px-3 py-2.5"
                      @click.stop
                    >
                      <button
                        class="w-full rounded-lg bg-amber-50 py-1.5 text-[12px] font-semibold text-amber-700 hover:bg-amber-100 transition disabled:opacity-40"
                        :disabled="updatingId === card.orderDetail.id"
                        @click="requestAdvanceStatus(card)"
                      >
                        {{
                          updatingId === card.orderDetail.id
                            ? "Actualizando…"
                            : "Iniciar producción →"
                        }}
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="pendingLines.length === 0"
                    class="py-10 text-center text-[12px] text-gray-400"
                  >
                    Sin pedidos pendientes
                  </div>
                </div>
              </div>

              <!-- En producción (IN PROCESS) -->
              <div class="flex flex-col">
                <div
                  class="px-4 py-3 flex items-center gap-2 border-b border-black/[0.06]"
                >
                  <span
                    class="h-2.5 w-2.5 rounded-full bg-violet-400 shrink-0"
                  ></span>
                  <span class="text-[13px] font-semibold text-[#111827]"
                    >En producción</span
                  >
                  <span
                    class="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700"
                    >{{ inProcessLines.length }}</span
                  >
                </div>
                <div class="bg-gray-50/60 p-3 space-y-2.5 min-h-[260px] flex-1">
                  <div
                    v-for="card in inProcessLines"
                    :key="card.orderDetail.id"
                    class="bg-white rounded-xl ring-1 ring-black/[0.07] overflow-hidden cursor-pointer hover:ring-black/[0.14] hover:shadow-sm transition"
                    @click="
                      navigateTo(
                        '/admin/pedidos/detalle/' + card.orderDetail.order.id,
                      )
                    "
                  >
                    <div class="h-1 bg-violet-400"></div>
                    <div
                      class="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2"
                    >
                      <span
                        class="font-bold text-[13px] text-[#111827] leading-tight truncate"
                        >{{ card.orderDetail.order.orderCode ?? "—" }}</span
                      >
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 mt-0.5"
                        :style="{ ...typeColor(card.orderDetail.order) }"
                        >{{ typeLabel(card.orderDetail.order) }}</span
                      >
                    </div>
                    <div
                      class="px-3.5 pb-3 space-y-1.5 text-[12px] text-gray-500"
                    >
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
                        }}<span
                          v-if="card.orderDetail.order.deliveryTime"
                          class="text-gray-400"
                        >
                          · {{ card.orderDetail.order.deliveryTime }}</span
                        >
                      </div>
                      <div
                        v-if="
                          card.orderDetail.order.remainingBalance &&
                          parseFloat(
                            String(card.orderDetail.order.remainingBalance),
                          ) > 0
                        "
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
                    </div>
                    <div
                      class="border-t border-black/[0.06] px-3 py-2.5"
                      @click.stop
                    >
                      <button
                        class="w-full rounded-lg bg-violet-50 py-1.5 text-[12px] font-semibold text-violet-700 hover:bg-violet-100 transition disabled:opacity-40"
                        :disabled="updatingId === card.orderDetail.id"
                        @click="requestAdvanceStatus(card)"
                      >
                        {{
                          updatingId === card.orderDetail.id
                            ? "Actualizando…"
                            : "Marcar como listo →"
                        }}
                      </button>
                    </div>
                  </div>
                  <div
                    v-if="inProcessLines.length === 0"
                    class="py-10 text-center text-[12px] text-gray-400"
                  >
                    Sin pedidos en producción
                  </div>
                </div>
              </div>

              <!-- Listos (DONE) -->
              <div class="flex flex-col">
                <div
                  class="px-4 py-3 flex items-center gap-2 border-b border-black/[0.06]"
                >
                  <span
                    class="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0"
                  ></span>
                  <span class="text-[13px] font-semibold text-[#111827]"
                    >Listos</span
                  >
                  <span
                    class="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700"
                    >{{ doneLines.length }}</span
                  >
                </div>
                <div class="bg-gray-50/60 p-3 space-y-2.5 min-h-[260px] flex-1">
                  <div
                    v-for="card in doneLines"
                    :key="card.orderDetail.id"
                    class="bg-white rounded-xl ring-1 ring-black/[0.07] overflow-hidden cursor-pointer hover:ring-black/[0.14] hover:shadow-sm transition"
                    @click="
                      navigateTo(
                        '/admin/pedidos/detalle/' + card.orderDetail.order.id,
                      )
                    "
                  >
                    <div class="h-1 bg-emerald-400"></div>
                    <div
                      class="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2"
                    >
                      <span
                        class="font-bold text-[13px] text-[#111827] leading-tight truncate"
                        >{{ card.orderDetail.order.orderCode ?? "—" }}</span
                      >
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 mt-0.5"
                        :style="{ ...typeColor(card.orderDetail.order) }"
                        >{{ typeLabel(card.orderDetail.order) }}</span
                      >
                    </div>
                    <div
                      class="px-3.5 pb-4 space-y-1.5 text-[12px] text-gray-500"
                    >
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
                        }}<span
                          v-if="card.orderDetail.order.deliveryTime"
                          class="text-gray-400"
                        >
                          · {{ card.orderDetail.order.deliveryTime }}</span
                        >
                      </div>
                      <div
                        class="flex items-center gap-1.5 text-emerald-600 font-medium"
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
                  </div>
                  <div
                    v-if="doneLines.length === 0"
                    class="py-10 text-center text-[12px] text-gray-400"
                  >
                    Sin pedidos listos
                  </div>
                </div>
              </div>
            </div>
            <!-- /columnas -->
          </div>
          <!-- /contenedor blanco -->
        </template>
      </template>
    </div>
  </section>

  <OrderDetailModal
    :open="detailOpen"
    :order="selectedOrder"
    @close="detailOpen = false"
    @order-updated="onOrderPaymentUpdated"
  />

  <!-- ── CONFIRMAR AVANCE DE ESTADO (KANBAN) ────────────────────── -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="kanbanConfirmTarget"
        class="fixed inset-0 z-[110] flex items-center justify-center px-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="kanbanConfirmTarget = null"
        />

        <!-- Panel -->
        <div
          class="relative z-10 w-full max-w-[380px] rounded-3xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.08] overflow-hidden"
        >
          <!-- Ícono centrado -->
          <div class="flex flex-col items-center pt-8 pb-5 px-8 text-center">
            <div
              class="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#FFBEE6]/40 ring-2 ring-[#FFBEE6]"
            >
              <svg
                class="h-7 w-7 text-[#C9007C]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
                />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <h3 class="text-[17px] font-bold text-[#111827] leading-snug">
              Cambiar estado de la línea
            </h3>
            <p class="mt-1.5 text-[13px] text-gray-500">
              <span class="font-semibold text-[#111827]">{{
                kanbanConfirmTarget.orderDetail.order.orderCode
              }}</span>
              pasará de
            </p>
            <!-- Flecha de estado -->
            <div class="mt-3 flex items-center justify-center gap-2.5">
              <span
                class="inline-flex rounded-full px-3 py-1 text-[12px] font-bold"
                :class="
                  lineStatus(kanbanConfirmTarget) === 'PENDING'
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-[#FFBEE6] text-[#C9007C]'
                "
                >{{
                  PRODUCTION_STATUS_LABELS[lineStatus(kanbanConfirmTarget)]
                }}</span
              >
              <svg
                class="h-4 w-4 text-gray-300 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              <span
                class="inline-flex rounded-full px-3 py-1 text-[12px] font-bold bg-[#FFBEE6] text-[#C9007C]"
              >
                {{
                  PRODUCTION_STATUS_LABELS[
                    nextLineStatus(lineStatus(kanbanConfirmTarget))
                  ]
                }}
              </span>
            </div>
          </div>

          <!-- Separador -->
          <div class="mx-6 border-t border-black/[0.06]" />

          <!-- Botones -->
          <div class="flex gap-3 px-6 py-5">
            <button
              type="button"
              class="flex-1 rounded-2xl border border-black/10 py-3 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition"
              @click="kanbanConfirmTarget = null"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="flex-1 rounded-2xl py-3 text-[13px] font-bold bg-[#C9007C] text-white hover:bg-[#a5006a] transition shadow-sm"
              @click="confirmAdvanceStatus"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── MARCAR ENTREGADO ─────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="deliverConfirm"
        class="fixed inset-0 z-[110] flex items-center justify-center px-4"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="deliverConfirm = false"
        />
        <div
          class="relative z-10 w-full max-w-[380px] rounded-3xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.08] overflow-hidden"
        >
          <div class="flex flex-col items-center pt-8 pb-5 px-8 text-center">
            <div
              class="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-green-50 ring-2 ring-green-200"
            >
              <svg
                class="h-7 w-7 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 class="text-[17px] font-bold text-[#111827] leading-snug">
              Marcar como entregado
            </h3>
            <p class="mt-1.5 text-[13px] text-gray-500 leading-relaxed">
              ¿Confirmas que el pedido
              <span class="font-semibold text-[#111827]">{{
                deliverTarget?.orderCode
              }}</span>
              fue entregado al cliente?
            </p>
            <p class="mt-1 text-[11px] text-gray-400">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div class="mx-6 border-t border-black/[0.06]" />
          <div class="flex gap-3 px-6 py-5">
            <button
              type="button"
              class="flex-1 rounded-2xl border border-black/10 py-3 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition"
              @click="deliverConfirm = false"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="flex-1 rounded-2xl py-3 text-[13px] font-bold bg-green-600 text-white hover:bg-green-700 transition shadow-sm disabled:opacity-50"
              :disabled="delivering"
              @click="executeDeliver"
            >
              <span
                v-if="delivering"
                class="flex items-center justify-center gap-2"
              >
                <span
                  class="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                />
              </span>
              <span v-else>Confirmar entrega</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── CANCELAR PEDIDO ────────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="cancelConfirm"
        class="fixed inset-0 z-[110] flex items-center justify-center px-4"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="cancelConfirm = false"
        />
        <div
          class="relative z-10 w-full max-w-[380px] rounded-3xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.08] overflow-hidden"
        >
          <div class="flex flex-col items-center pt-8 pb-5 px-8 text-center">
            <div
              class="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-orange-50 ring-2 ring-orange-200"
            >
              <svg
                class="h-7 w-7 text-orange-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" stroke-linecap="round" />
                <line
                  x1="12"
                  y1="16"
                  x2="12.01"
                  y2="16"
                  stroke-linecap="round"
                />
              </svg>
            </div>
            <h3 class="text-[17px] font-bold text-[#111827] leading-snug">
              Cancelar pedido
            </h3>
            <p class="mt-1.5 text-[13px] text-gray-500 leading-relaxed">
              Se cancelará el pedido
              <span class="font-semibold text-[#111827]">{{
                cancelTarget?.orderCode
              }}</span
              >.
            </p>
          </div>
          <div class="mx-6 border-t border-black/[0.06]" />
          <div class="px-6 pt-4 pb-2">
            <label
              class="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5"
              >Motivo de cancelación</label
            >
            <textarea
              v-model="cancelReason"
              rows="3"
              placeholder="Escribe el motivo..."
              class="w-full rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50 resize-none"
            />
          </div>
          <div class="flex gap-3 px-6 pb-5 pt-3">
            <button
              type="button"
              class="flex-1 rounded-2xl border border-black/10 py-3 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition"
              @click="cancelConfirm = false"
            >
              Volver
            </button>
            <button
              type="button"
              class="flex-1 rounded-2xl py-3 text-[13px] font-bold bg-orange-500 text-white hover:bg-orange-600 transition shadow-sm disabled:opacity-50"
              :disabled="canceling || !cancelReason.trim()"
              @click="executeCancel"
            >
              <span
                v-if="canceling"
                class="flex items-center justify-center gap-2"
              >
                <span
                  class="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                />
              </span>
              <span v-else>Cancelar pedido</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <OrderEmployeePinModal
    v-model="employeePinModalOpen"
    :loading="employeePinLoading"
    :error="employeePinError"
    :action-label="employeePinActionLabel"
    @submit="onEmployeePinSubmit"
  />
</template>
