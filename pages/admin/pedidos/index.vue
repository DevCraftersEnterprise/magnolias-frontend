<script setup lang="ts">
definePageMeta({ layout: "admin" });
useHead({ title: "Pedidos · Magnolias" });

import {
  ordersService,
  TYPE_LABELS,
  STATUS_LABELS,
  TYPE_COLORS,
  STATUS_COLORS,
  type OrderItem,
  type OrderStatus,
  type OrderType,
} from "~/services/orders.service";
import OrderDetailModal from "~/components/modals/OrderDetailModal.vue";

const { user } = useAuthUser();
const { selectedBranch } = useBranch();

const isBaker = computed(() => user.value?.role === "BAKER");

// ─── Helpers ────────────────────────────────────────────────────────────────
function isoDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatDate(iso: string) {
  if (!iso) return "—";
  // El backend devuelve ISO datetime "2024-12-31T15:00:00Z"
  const date = new Date(iso);
  const d = String(date.getUTCDate()).padStart(2, "0");
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const y = date.getUTCFullYear();
  return `${d}/${m}/${y}`;
}

function typeColor(t?: OrderType) {
  return t
    ? (TYPE_COLORS[t] ?? { bg: "#eee", text: "#333" })
    : { bg: "#eee", text: "#333" };
}
function typeLabel(t?: OrderType) {
  return t ? (TYPE_LABELS[t] ?? t) : "—";
}

// ─── TABLE STATE ─────────────────────────────────────────────────────────────
const loading = ref(true);
const errorMsg = ref("");
const orders = ref<OrderItem[]>([]);
const offset = ref(0);
const limit = ref(15);
const hasMore = ref(false);
const total = ref(0);

const filterStatus = ref<OrderStatus | "">("");
const nameQuery = ref("");
const debouncedName = ref("");
let searchTimer: any = null;
watch(nameQuery, (v) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => (debouncedName.value = (v ?? "").trim()), 350);
});
function clearSearch() {
  nameQuery.value = "";
  debouncedName.value = "";
  loadOrders(true);
}
const cancelTarget = ref<OrderItem | null>(null);
const cancelConfirm = ref(false);
const canceling = ref(false);
const cancelReason = ref('');

const showingFrom = computed(() =>
  orders.value.length === 0 ? 0 : offset.value + 1,
);
const showingTo = computed(() => offset.value + orders.value.length);
const showPagination = computed(
  () => !loading.value && (offset.value > 0 || hasMore.value),
);

async function loadOrders(reset = false) {
  if (isBaker.value) return;
  if (!selectedBranch.value?.id) {
    // Sin sucursal seleccionada no se puede llamar al endpoint
    orders.value = [];
    loading.value = false;
    errorMsg.value = "";
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    if (reset) {
      offset.value = 0;
      orders.value = [];
    }
    const data = await ordersService.getOrders(selectedBranch.value.id, {
      orderStatus: filterStatus.value || undefined,
      name: debouncedName.value || undefined,
      limit: limit.value,
      offset: offset.value,
    });
    orders.value = data.items ?? [];
    total.value = data.total;
    hasMore.value = data.pagination.currentPage < data.pagination.totalPages;
  } catch (e: any) {
    errorMsg.value = e?.message || "Error al cargar pedidos.";
  } finally {
    loading.value = false;
  }
}

async function prevPage() {
  if (offset.value === 0) return;
  offset.value = Math.max(0, offset.value - limit.value);
  await loadOrders(false);
}

async function nextPage() {
  if (!hasMore.value) return;
  offset.value += limit.value;
  await loadOrders(false);
}

function confirmCancel(order: OrderItem) {
  cancelTarget.value = order;
  cancelReason.value = '';
  cancelConfirm.value = true;
}

async function executeCancel() {
  if (!cancelTarget.value || canceling.value) return;
  canceling.value = true;
  try {
    await ordersService.cancelOrder(cancelTarget.value.id, cancelReason.value);
    cancelConfirm.value = false;
    cancelTarget.value = null;
    cancelReason.value = '';
    await loadOrders(true);
  } catch (e: any) {
    errorMsg.value = e?.message || "No se pudo cancelar el pedido.";
    cancelConfirm.value = false;
  } finally {
    canceling.value = false;
  }
}

// ─── KANBAN STATE ─────────────────────────────────────────────────────────────
type KanbanTab = "tomorrow" | "dayAfter";
const kanbanTab = ref<KanbanTab>("tomorrow");
const kanbanLoading = ref(true);
const kanbanError = ref("");
const kanbanOrders = ref<OrderItem[]>([]);
const updatingId = ref<string | null>(null);

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
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" });
});

const dayAfterLabel = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" });
});

// Filtra por fecha de entrega (comparando solo la parte de fecha del ISO)
function deliveryDateStr(iso: string) {
  if (!iso) return "";
  return iso.split("T")[0];
}

const tomorrowOrders = computed(() =>
  kanbanOrders.value.filter(
    (o) => deliveryDateStr(o.deliveryDate) === tomorrowStr.value,
  ),
);
const dayAfterOrders = computed(() =>
  kanbanOrders.value.filter(
    (o) => deliveryDateStr(o.deliveryDate) === dayAfterStr.value,
  ),
);
const activeKanbanOrders = computed(() =>
  kanbanTab.value === "tomorrow" ? tomorrowOrders.value : dayAfterOrders.value,
);

const pendingOrders = computed(() =>
  activeKanbanOrders.value.filter((o) => o.status === "CREATED"),
);
const inProcessOrders = computed(() =>
  activeKanbanOrders.value.filter((o) => o.status === "IN PROCESS"),
);
const doneOrders = computed(() =>
  activeKanbanOrders.value.filter((o) => o.status === "DONE"),
);

async function loadKanbanOrders() {
  if (!isBaker.value) return;
  if (!selectedBranch.value?.id) {
    kanbanOrders.value = [];
    kanbanLoading.value = false;
    return;
  }
  kanbanLoading.value = true;
  kanbanError.value = "";
  try {
    const data = await ordersService.getOrders(selectedBranch.value.id, {
      limit: 200,
      offset: 0,
    });
    kanbanOrders.value = data.items ?? [];
  } catch (e: any) {
    kanbanError.value = e?.message || "Error al cargar pedidos.";
  } finally {
    kanbanLoading.value = false;
  }
}

async function advanceStatus(order: OrderItem) {
  if (updatingId.value) return;
  updatingId.value = order.id;
  try {
    if (order.status === 'CREATED') {
      await ordersService.markInProcess(order.id);
      order.status = 'IN PROCESS';
    } else if (order.status === 'IN PROCESS') {
      await ordersService.markDone(order.id);
      order.status = 'DONE';
    }
  } catch (e: any) {
    console.error("Error actualizando estado:", e);
  } finally {
    updatingId.value = null;
  }
}

// ── Kanban confirm modal ──────────────────────────────────────────────
const kanbanConfirmTarget = ref<OrderItem | null>(null)
function requestAdvanceStatus(order: OrderItem) {
  if (updatingId.value) return
  kanbanConfirmTarget.value = order
}
async function confirmAdvanceStatus() {
  const order = kanbanConfirmTarget.value
  kanbanConfirmTarget.value = null
  if (!order) return
  await advanceStatus(order)
}

// ─── Lifecycle & watchers ─────────────────────────────────────────────────────
onMounted(() => {
  if (isBaker.value) loadKanbanOrders();
  else loadOrders(true);
});

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
              </div>

              <!-- Buscador por nombre (móvil + web) -->
              <div class="relative w-full sm:flex-1 sm:min-w-[180px]">
                <input
                  v-model="nameQuery"
                  type="text"
                  class="w-full h-10 rounded-xl bg-white pl-10 pr-10 text-[14px] text-[#111827] placeholder:text-gray-400 outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/10"
                  placeholder="Buscar por nombre del cliente"
                />
                <svg
                  viewBox="0 0 24 24"
                  class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <button
                  v-if="nameQuery"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-lg hover:bg-black/5 text-gray-500"
                  aria-label="Limpiar búsqueda"
                  @click="clearSearch"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>

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
              <!-- Error -->
              <div
                v-if="errorMsg"
                class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 ring-1 ring-red-200"
              >
                {{ errorMsg }}
              </div>

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
                            Tipo
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

                          <!-- Tipo (badge) -->
                          <td class="px-4 py-3">
                            <span
                              class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
                              :style="{ ...typeColor(order.orderType) }"
                            >
                              {{ typeLabel(order.orderType) }}
                            </span>
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
                              <!-- Cancelar pedido -->
                              <button
                                type="button"
                                class="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition"
                                title="Cancelar pedido"
                                @click="confirmCancel(order)"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  class="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-width="2"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="15" y1="9" x2="9" y2="15" stroke-linecap="round" />
                                  <line x1="9" y1="9" x2="15" y2="15" stroke-linecap="round" />
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
                        <p class="text-gray-400">Tipo</p>
                        <span
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                          :style="{ ...typeColor(order.orderType) }"
                        >
                          {{ typeLabel(order.orderType) }}
                        </span>
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
                  >Mostrando {{ showingFrom }}–{{ showingTo }} de
                  {{ total }}</span
                >
                <div class="flex gap-2">
                  <button
                    class="h-8 px-3 rounded-lg ring-1 ring-black/10 bg-white hover:bg-black/5 disabled:opacity-40 transition text-[13px]"
                    :disabled="offset === 0"
                    @click="prevPage"
                  >
                    Anterior
                  </button>
                  <button
                    class="h-8 px-3 rounded-lg ring-1 ring-black/10 bg-white hover:bg-black/5 disabled:opacity-40 transition text-[13px]"
                    :disabled="!hasMore"
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
          <div class="rounded-2xl bg-white shadow-sm ring-1 ring-black/10 overflow-hidden">

            <!-- ── Topbar del tablero ── -->
            <div class="px-6 pt-5 pb-4 border-b border-black/[0.06] flex flex-wrap items-center justify-between gap-4">
              <div>
                <p class="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Tablero de producción</p>
                <h2 class="mt-0.5 text-[18px] font-bold text-[#111827]">{{ selectedBranch.name }}</h2>
              </div>

              <!-- Tabs -->
              <div class="flex gap-1 rounded-xl bg-gray-100 p-1">
                <button
                  class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                  :class="kanbanTab === 'tomorrow' ? 'bg-white shadow-sm text-[#111827]' : 'text-gray-400 hover:text-gray-600'"
                  @click="kanbanTab = 'tomorrow'"
                >
                  <span class="text-[12px] font-semibold leading-tight">Para mañana <span class="font-normal opacity-60">({{ tomorrowOrders.length }})</span></span>
                  <span class="text-[11px] capitalize opacity-50 leading-tight">{{ tomorrowLabel }}</span>
                </button>
                <button
                  class="flex flex-col items-start px-4 py-2 rounded-lg text-left transition"
                  :class="kanbanTab === 'dayAfter' ? 'bg-white shadow-sm text-[#111827]' : 'text-gray-400 hover:text-gray-600'"
                  @click="kanbanTab = 'dayAfter'"
                >
                  <span class="text-[12px] font-semibold leading-tight">Pasado mañana <span class="font-normal opacity-60">({{ dayAfterOrders.length }})</span></span>
                  <span class="text-[11px] capitalize opacity-50 leading-tight">{{ dayAfterLabel }}</span>
                </button>
              </div>

              <!-- Actualizar -->
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 h-9 text-[13px] text-gray-500 hover:bg-gray-200 transition disabled:opacity-40 shrink-0"
                :disabled="kanbanLoading"
                @click="loadKanbanOrders"
              >
                <svg
                  class="h-3.5 w-3.5"
                  :class="{ 'animate-spin': kanbanLoading }"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Actualizar
              </button>
            </div>

            <!-- Error -->
            <div v-if="kanbanError" class="m-5 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 ring-1 ring-red-200">
              {{ kanbanError }}
            </div>

            <!-- Loading -->
            <div v-else-if="kanbanLoading" class="py-16 flex justify-center">
              <div class="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"></div>
            </div>

            <!-- ── Columnas ── -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-black/[0.06]">

              <!-- Pendientes (CREATED) -->
              <div class="flex flex-col">
                <div class="px-4 py-3 flex items-center gap-2 border-b border-black/[0.06]">
                  <span class="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0"></span>
                  <span class="text-[13px] font-semibold text-[#111827]">Pendientes</span>
                  <span class="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{{ pendingOrders.length }}</span>
                </div>
                <div class="bg-gray-50/60 p-3 space-y-2.5 min-h-[260px] flex-1">
                  <div
                    v-for="order in pendingOrders"
                    :key="order.id"
                    class="bg-white rounded-xl ring-1 ring-black/[0.07] overflow-hidden cursor-pointer hover:ring-black/[0.14] hover:shadow-sm transition"
                    @click="navigateTo('/admin/pedidos/detalle/' + order.id)"
                  >
                    <div class="h-1 bg-amber-400"></div>
                    <div class="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2">
                      <span class="font-bold text-[13px] text-[#111827] leading-tight truncate">{{ order.orderCode ?? '—' }}</span>
                      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 mt-0.5" :style="{ ...typeColor(order.orderType) }">{{ typeLabel(order.orderType) }}</span>
                    </div>
                    <div class="px-3.5 pb-3 space-y-1.5 text-[12px] text-gray-500">
                      <div v-if="order.customer?.fullName" class="flex items-center gap-1.5 truncate">
                        <svg class="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span class="truncate">{{ order.customer.fullName }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <svg class="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        {{ formatDate(order.deliveryDate) }}<span v-if="order.deliveryTime" class="text-gray-400"> · {{ order.deliveryTime }}</span>
                      </div>
                      <div v-if="order.remainingBalance && parseFloat(String(order.remainingBalance)) > 0" class="flex items-center gap-1.5 text-orange-500 font-medium">
                        <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke-linecap="round"/></svg>
                        Saldo pendiente
                      </div>
                    </div>
                    <div class="border-t border-black/[0.06] px-3 py-2.5" @click.stop>
                      <button
                        class="w-full rounded-lg bg-amber-50 py-1.5 text-[12px] font-semibold text-amber-700 hover:bg-amber-100 transition disabled:opacity-40"
                        :disabled="updatingId === order.id"
                        @click="requestAdvanceStatus(order)"
                      >{{ updatingId === order.id ? 'Actualizando…' : 'Iniciar producción →' }}</button>
                    </div>
                  </div>
                  <div v-if="pendingOrders.length === 0" class="py-10 text-center text-[12px] text-gray-400">
                    Sin pedidos pendientes
                  </div>
                </div>
              </div>

              <!-- En producción (IN PROCESS) -->
              <div class="flex flex-col">
                <div class="px-4 py-3 flex items-center gap-2 border-b border-black/[0.06]">
                  <span class="h-2.5 w-2.5 rounded-full bg-violet-400 shrink-0"></span>
                  <span class="text-[13px] font-semibold text-[#111827]">En producción</span>
                  <span class="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-700">{{ inProcessOrders.length }}</span>
                </div>
                <div class="bg-gray-50/60 p-3 space-y-2.5 min-h-[260px] flex-1">
                  <div
                    v-for="order in inProcessOrders"
                    :key="order.id"
                    class="bg-white rounded-xl ring-1 ring-black/[0.07] overflow-hidden cursor-pointer hover:ring-black/[0.14] hover:shadow-sm transition"
                    @click="navigateTo('/admin/pedidos/detalle/' + order.id)"
                  >
                    <div class="h-1 bg-violet-400"></div>
                    <div class="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2">
                      <span class="font-bold text-[13px] text-[#111827] leading-tight truncate">{{ order.orderCode ?? '—' }}</span>
                      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 mt-0.5" :style="{ ...typeColor(order.orderType) }">{{ typeLabel(order.orderType) }}</span>
                    </div>
                    <div class="px-3.5 pb-3 space-y-1.5 text-[12px] text-gray-500">
                      <div v-if="order.customer?.fullName" class="flex items-center gap-1.5 truncate">
                        <svg class="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span class="truncate">{{ order.customer.fullName }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <svg class="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        {{ formatDate(order.deliveryDate) }}<span v-if="order.deliveryTime" class="text-gray-400"> · {{ order.deliveryTime }}</span>
                      </div>
                      <div v-if="order.remainingBalance && parseFloat(String(order.remainingBalance)) > 0" class="flex items-center gap-1.5 text-orange-500 font-medium">
                        <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01" stroke-linecap="round"/></svg>
                        Saldo pendiente
                      </div>
                    </div>
                    <div class="border-t border-black/[0.06] px-3 py-2.5" @click.stop>
                      <button
                        class="w-full rounded-lg bg-violet-50 py-1.5 text-[12px] font-semibold text-violet-700 hover:bg-violet-100 transition disabled:opacity-40"
                        :disabled="updatingId === order.id"
                        @click="requestAdvanceStatus(order)"
                      >{{ updatingId === order.id ? 'Actualizando…' : 'Marcar como listo →' }}</button>
                    </div>
                  </div>
                  <div v-if="inProcessOrders.length === 0" class="py-10 text-center text-[12px] text-gray-400">
                    Sin pedidos en producción
                  </div>
                </div>
              </div>

              <!-- Listos (DONE) -->
              <div class="flex flex-col">
                <div class="px-4 py-3 flex items-center gap-2 border-b border-black/[0.06]">
                  <span class="h-2.5 w-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <span class="text-[13px] font-semibold text-[#111827]">Listos</span>
                  <span class="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">{{ doneOrders.length }}</span>
                </div>
                <div class="bg-gray-50/60 p-3 space-y-2.5 min-h-[260px] flex-1">
                  <div
                    v-for="order in doneOrders"
                    :key="order.id"
                    class="bg-white rounded-xl ring-1 ring-black/[0.07] overflow-hidden cursor-pointer hover:ring-black/[0.14] hover:shadow-sm transition"
                    @click="navigateTo('/admin/pedidos/detalle/' + order.id)"
                  >
                    <div class="h-1 bg-emerald-400"></div>
                    <div class="px-3.5 pt-3 pb-2 flex items-start justify-between gap-2">
                      <span class="font-bold text-[13px] text-[#111827] leading-tight truncate">{{ order.orderCode ?? '—' }}</span>
                      <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap shrink-0 mt-0.5" :style="{ ...typeColor(order.orderType) }">{{ typeLabel(order.orderType) }}</span>
                    </div>
                    <div class="px-3.5 pb-4 space-y-1.5 text-[12px] text-gray-500">
                      <div v-if="order.customer?.fullName" class="flex items-center gap-1.5 truncate">
                        <svg class="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span class="truncate">{{ order.customer.fullName }}</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <svg class="h-3 w-3 shrink-0 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                        {{ formatDate(order.deliveryDate) }}<span v-if="order.deliveryTime" class="text-gray-400"> · {{ order.deliveryTime }}</span>
                      </div>
                      <div class="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <svg class="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                        Listo para entregar
                      </div>
                    </div>
                  </div>
                  <div v-if="doneOrders.length === 0" class="py-10 text-center text-[12px] text-gray-400">
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
        class="fixed inset-0 z-[110] flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/40" @click="kanbanConfirmTarget = null" />
        <div class="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-xl ring-1 ring-black/10 overflow-hidden">
          <div :class="['h-1.5', kanbanConfirmTarget.status === 'CREATED' ? 'bg-amber-400' : 'bg-violet-500']" />
          <div class="px-6 pt-5 pb-6">
            <h3 class="text-[16px] font-bold text-[#111827]">¿Confirmar cambio de estado?</h3>
            <p class="mt-2 text-[13px] text-gray-500 leading-relaxed">
              El pedido <span class="font-semibold text-[#111827]">{{ kanbanConfirmTarget.orderCode }}</span> pasará de
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold"
                :style="{ backgroundColor: STATUS_COLORS[kanbanConfirmTarget.status]?.bg, color: STATUS_COLORS[kanbanConfirmTarget.status]?.text }"
              >{{ STATUS_LABELS[kanbanConfirmTarget.status] }}</span>
              a
              <span :class="['inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold', kanbanConfirmTarget.status === 'CREATED' ? 'bg-amber-100 text-amber-800' : 'bg-violet-100 text-violet-800']">
                {{ kanbanConfirmTarget.status === 'CREATED' ? 'En producción' : 'Listo' }}
              </span>.
            </p>
            <div class="mt-5 flex gap-3">
              <button
                type="button"
                class="flex-1 rounded-xl border border-black/10 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition"
                @click="kanbanConfirmTarget = null"
              >Cancelar</button>
              <button
                type="button"
                :class="['flex-1 rounded-xl py-2.5 text-[13px] font-bold transition', kanbanConfirmTarget.status === 'CREATED' ? 'bg-amber-400 text-amber-950 hover:bg-amber-500' : 'bg-violet-500 text-white hover:bg-violet-600']"
                @click="confirmAdvanceStatus"
              >Confirmar</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ── CANCELAR PEDIDO ────────────────────────────────────────────── -->
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
        v-if="cancelConfirm"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/60"
          @click="cancelConfirm = false"
        />
        <div
          class="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 p-6"
        >
          <h3 class="text-[16px] font-bold text-[#111827]">
            ¿Cancelar pedido?
          </h3>
          <p class="mt-2 text-[13px] text-gray-500">
            Se cancelará el pedido
            <span class="font-semibold text-[#111827]">{{
              cancelTarget?.orderCode
            }}</span
            >. Ingresa el motivo de cancelación.
          </p>
          <textarea
            v-model="cancelReason"
            rows="3"
            placeholder="Motivo de cancelación..."
            class="mt-4 w-full rounded-xl border border-black/10 bg-gray-50 px-3 py-2 text-[13px] text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111827]/20 resize-none"
          />
          <div class="mt-5 flex justify-end gap-2">
            <button
              type="button"
              class="h-9 px-4 rounded-xl text-[13px] ring-1 ring-black/10 hover:bg-black/5 transition"
              @click="cancelConfirm = false"
            >
              Volver
            </button>
            <button
              type="button"
              class="h-9 px-4 rounded-xl text-[13px] font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 transition"
              :disabled="canceling || !cancelReason.trim()"
              @click="executeCancel"
            >
              <span v-if="canceling" class="flex items-center gap-2"
                ><span
                  class="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
              /></span>
              <span v-else>Cancelar pedido</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
