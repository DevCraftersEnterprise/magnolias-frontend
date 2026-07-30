<script setup lang="ts">
definePageMeta({ layout: "admin", pageTitle: "Detalle de pedido" });
useHead({ title: "Detalle de pedido · Magnolias" });

import { ordersService } from "~/services/orders.service";
import type { OrderDetail, OrderStatus, OrderType } from "~/types/order.types";
import { useToast } from "vue-toastification";

const route = useRoute();
const id = route.params.id as string;

// ─── Auth guard ─────────────────────────────────────────────────────────────
// effectiveRole puede cambiar sin cambio de ruta (toggle "ver como pastelero"
// desactivado estando ya en esta página), por eso se observa reactivamente.
const { effectiveRole } = useViewAs();
if (effectiveRole.value !== "BAKER") {
  await navigateTo("/admin/pedidos", { replace: true });
}
watch(effectiveRole, () => {
  if (effectiveRole.value !== "BAKER") {
    navigateTo("/admin/pedidos", { replace: true });
  }
});

const { locationLabel } = useOrderCatalogs();
const toast = useToast();

// ─── Load detail ────────────────────────────────────────────────────────────
const order = ref<OrderDetail | null>(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    order.value = await ordersService.getOrder(id);
  } catch (e: any) {
    error.value = e?.message || "No se pudo cargar el pedido.";
  } finally {
    loading.value = false;
  }
});

// ─── Status advance ──────────────────────────────────────────────────────────
const advancing = ref(false);
const confirmOpen = ref(false);

const canAdvance = computed(
  () =>
    order.value?.status === "CREATED" || order.value?.status === "IN PROCESS",
);
const advanceLabel = computed(() => {
  if (order.value?.status === "CREATED") return "Iniciar producción";
  if (order.value?.status === "IN PROCESS") return "Marcar como listo";
  return "";
});
const advanceNextLabel = computed(() => {
  if (order.value?.status === "CREATED") return "En producción";
  if (order.value?.status === "IN PROCESS") return "Listo";
  return "";
});

function requestAdvance() {
  if (!order.value || !canAdvance.value) return;
  confirmOpen.value = true;
}

async function advance() {
  if (!order.value || advancing.value) return;
  confirmOpen.value = false;
  advancing.value = true;
  try {
    if (order.value.status === "CREATED") {
      await ordersService.markInProcess(order.value.id);
      order.value.status = "IN PROCESS";
      toast.success("Producción iniciada.");
    } else if (order.value.status === "IN PROCESS") {
      await ordersService.markDone(order.value.id);
      order.value.status = "DONE";
      toast.success("Pedido marcado como listo.");
    }
  } catch (e: any) {
    toast.error(e?.message || "No se pudo actualizar el estado.");
  } finally {
    advancing.value = false;
  }
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
const lightboxSrc = ref<string | null>(null);
function openLightbox(src: string) {
  lightboxSrc.value = src;
}
function closeLightbox() {
  lightboxSrc.value = null;
}

// zoom state
const zoom = ref(1);
const pan = ref({ x: 0, y: 0 });
const dragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const panStart = ref({ x: 0, y: 0 });

function onWheel(e: WheelEvent) {
  e.preventDefault();
  zoom.value = Math.min(5, Math.max(1, zoom.value - e.deltaY * 0.001));
  if (zoom.value === 1) pan.value = { x: 0, y: 0 };
}
function onMousedown(e: MouseEvent) {
  if (zoom.value <= 1) return;
  dragging.value = true;
  dragStart.value = { x: e.clientX, y: e.clientY };
  panStart.value = { ...pan.value };
}
function onMousemove(e: MouseEvent) {
  if (!dragging.value) return;
  pan.value = {
    x: panStart.value.x + e.clientX - dragStart.value.x,
    y: panStart.value.y + e.clientY - dragStart.value.y,
  };
}
function onMouseup() {
  dragging.value = false;
}
function resetZoom() {
  zoom.value = 1;
  pan.value = { x: 0, y: 0 };
}
watch(lightboxSrc, () => resetZoom());

// ─── Helpers ────────────────────────────────────────────────────────────────
function typeColor(t?: OrderType) {
  return t
    ? (TYPE_COLORS[t] ?? { bg: "#eee", text: "#333" })
    : { bg: "#eee", text: "#333" };
}
function typeLabel(t?: OrderType) {
  return t ? (TYPE_LABELS[t] ?? t) : "—";
}
function roundLabel(r?: string | null) {
  return r ? (DELIVERY_ROUND_LABELS[r] ?? r) : "—";
}
</script>

<template>
  <section class="min-h-[calc(100vh-86px)] bg-[#F3F3F4] font-sans">
    <div class="mx-auto w-full max-w-[1260px] px-4 py-6 lg:px-8 lg:py-8">
      <!-- Back -->
      <button
        type="button"
        class="mb-4 flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-[#111827] transition"
        @click="navigateTo('/admin/pedidos')"
      >
        <svg
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Volver al tablero
      </button>

      <!-- Loading -->
      <div v-if="loading" class="py-24 flex justify-center">
        <div
          class="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"
        ></div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-2xl bg-red-50 px-5 py-4 text-[13px] text-red-700 ring-1 ring-red-200"
      >
        {{ error }}
      </div>

      <template v-else-if="order">
        <!-- ══ HEADER CARD ═══════════════════════════════════════════════════ -->
        <div
          class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.06)] px-6 py-5 mb-5 flex flex-wrap items-center justify-between gap-4"
        >
          <div class="min-w-0">
            <p
              class="text-[11px] font-semibold tracking-widest text-gray-400 uppercase"
            >
              Pedido
            </p>
            <div class="flex flex-wrap items-center gap-2.5 mt-0.5">
              <h1
                class="text-[22px] font-bold text-[#111827] tracking-tight leading-tight"
              >
                {{ order.orderCode }}
              </h1>
              <span
                class="inline-flex rounded-full px-3 py-1 text-[12px] font-bold"
                :style="{
                  backgroundColor:
                    STATUS_COLORS[order.status as OrderStatus]?.bg,
                  color: STATUS_COLORS[order.status as OrderStatus]?.text,
                }"
                >{{ STATUS_LABELS[order.status as OrderStatus] }}</span
              >
              <span
                class="inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ring-black/5"
                :style="{ ...typeColor(order.orderType) }"
                >{{ typeLabel(order.orderType) }}</span
              >
              <span
                v-if="order.isCustomerPickup"
                class="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[12px] font-semibold text-amber-700 ring-1 ring-amber-200/50"
              >
                Recoge en tienda
              </span>
              <span
                v-if="order.branch"
                class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[12px] text-gray-600"
              >
                <svg
                  class="h-3 w-3 text-gray-400 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                {{ order.branch.name }}
              </span>
            </div>
          </div>

          <!-- CTA -->
          <button
            v-if="canAdvance"
            type="button"
            :disabled="advancing"
            class="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#C9007C] px-5 py-2.5 text-[14px] font-bold text-white shadow-sm hover:bg-[#a5006a] transition disabled:opacity-50"
            @click="requestAdvance"
          >
            <svg
              v-if="advancing"
              class="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {{ advancing ? "Actualizando…" : advanceLabel }}
          </button>
          <span
            v-else-if="order.status === 'DONE'"
            class="inline-flex items-center gap-1.5 rounded-xl bg-[#B9D9FF] px-4 py-2.5 text-[13px] font-bold text-[#0047C9]"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Listo para entregar
          </span>
        </div>

        <!-- Error de avance removido: ahora se muestra via toast -->

        <!-- ══ GRID PRINCIPAL ═════════════════════════════════════════════════ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <!-- ╔═ COL IZQUIERDA (2/3): productos + flores ═══════════════════╗ -->
          <div class="lg:col-span-2 space-y-5">
            <!-- ── PRODUCTOS ── -->
            <div v-if="order.details && order.details.length > 0">
              <div class="flex items-center gap-2 mb-3">
                <h2 class="text-[15px] font-bold text-[#111827]">Productos</h2>
                <span
                  class="rounded-full bg-[#F5E6FA] px-2.5 py-0.5 text-[11px] font-bold text-[#7C00C9]"
                  >{{ order.details.length }}</span
                >
              </div>

              <div class="space-y-4">
                <div
                  v-for="(detail, i) in order.details"
                  :key="detail.id"
                  class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.06)] overflow-hidden"
                >
                  <!-- Imágenes de referencia -->
                  <div
                    v-if="detail.referenceImages && detail.referenceImages.length > 0"
                    class="grid gap-1"
                    :class="detail.referenceImages.length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
                  >
                    <div
                      v-for="img in detail.referenceImages"
                      :key="img.id"
                      class="relative cursor-zoom-in group"
                      @click="openLightbox(img.imageUrl)"
                    >
                      <img
                        :src="img.imageUrl"
                        alt="Referencia"
                        class="w-full max-h-80 object-cover bg-gray-100 transition group-hover:brightness-90"
                      />
                      <span
                        class="absolute bottom-3 right-3 rounded-lg bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm flex items-center gap-1.5"
                      >
                        <svg
                          class="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
                        </svg>
                        Ver foto
                      </span>
                    </div>
                  </div>

                  <!-- Nombre + cantidad -->
                  <div
                    class="px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-black/[0.06]"
                  >
                    <div class="min-w-0">
                      <p
                        class="text-[20px] font-bold text-[#111827] leading-tight"
                      >
                        {{ detail.product?.name ?? `Producto ${i + 1}` }}
                      </p>
                      <p
                        v-if="detail.product?.description"
                        class="mt-1 text-[13px] text-gray-400"
                      >
                        {{ detail.product.description }}
                      </p>
                    </div>
                    <span
                      class="shrink-0 rounded-xl bg-[#F5E6FA] px-4 py-2 text-[16px] font-bold text-[#7C00C9]"
                      >× {{ detail.quantity }}</span
                    >
                  </div>

                  <!-- Atributos: ficha técnica -->
                  <dl class="divide-y divide-black/[0.06]">
                    <div
                      v-if="detail.productSize || detail.customSize"
                      class="flex items-center justify-between px-6 py-3.5"
                    >
                      <dt
                        class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 shrink-0 mr-6"
                      >
                        Tamaño
                      </dt>
                      <dd
                        class="text-[15px] font-bold text-[#111827] text-right"
                      >
                        {{
                          detail.productSize?.toUpperCase() === "CUSTOM"
                            ? detail.customSize?.toUpperCase()
                            : (detail.productSize ?? detail.customSize)
                        }}
                      </dd>
                    </div>
                    <div
                      v-if="detail.flavor"
                      class="flex items-center justify-between px-6 py-3.5"
                    >
                      <dt
                        class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 shrink-0 mr-6"
                      >
                        Sabor
                      </dt>
                      <dd
                        class="text-[15px] font-bold text-[#111827] text-right"
                      >
                        {{ detail.flavor.name }}
                      </dd>
                    </div>
                    <div
                      v-if="detail.filling"
                      class="flex items-center justify-between px-6 py-3.5"
                    >
                      <dt
                        class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 shrink-0 mr-6"
                      >
                        Relleno
                      </dt>
                      <dd
                        class="text-[15px] font-bold text-[#111827] text-right"
                      >
                        {{ detail.filling.name }}
                      </dd>
                    </div>
                    <div
                      v-if="detail.frosting"
                      class="flex items-center justify-between px-6 py-3.5"
                    >
                      <dt
                        class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 shrink-0 mr-6"
                      >
                        Betún
                      </dt>
                      <dd
                        class="text-[15px] font-bold text-[#111827] text-right"
                      >
                        {{ detail.frosting.name }}
                      </dd>
                    </div>
                    <div
                      v-if="detail.breadType"
                      class="flex items-center justify-between px-6 py-3.5"
                    >
                      <dt
                        class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 shrink-0 mr-6"
                      >
                        Tipo de pan
                      </dt>
                      <dd
                        class="text-[15px] font-bold text-[#111827] text-right"
                      >
                        {{ detail.breadType.name }}
                      </dd>
                    </div>
                    <div
                      v-if="detail.color"
                      class="flex items-center justify-between px-6 py-3.5"
                    >
                      <dt
                        class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 shrink-0 mr-6"
                      >
                        Color
                      </dt>
                      <dd
                        class="text-[15px] font-bold text-[#111827] text-right"
                      >
                        {{ detail.color.name }}
                      </dd>
                    </div>
                    <div
                      v-if="detail.style"
                      class="flex items-center justify-between px-6 py-3.5"
                    >
                      <dt
                        class="text-[11px] font-semibold uppercase tracking-widest text-gray-400 shrink-0 mr-6"
                      >
                        Forma
                      </dt>
                      <dd
                        class="text-[15px] font-bold text-[#111827] text-right"
                      >
                        {{ detail.style.name }}
                      </dd>
                    </div>
                  </dl>

                  <!-- Texto en pastel -->
                  <div
                    v-if="detail.hasWriting"
                    class="border-t border-black/[0.06]"
                  >
                    <!-- Cabecera con ícono de lápiz -->
                    <div class="flex items-center gap-2 px-6 pt-4 pb-3">
                      <svg
                        class="h-4 w-4 text-[#C9007C] shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                        />
                        <path
                          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                        />
                      </svg>
                      <span
                        class="text-[11px] font-bold uppercase tracking-widest text-[#C9007C]"
                        >Texto en pastel</span
                      >
                    </div>
                    <!-- Texto principal: grande, centrado, como si estuviera escrito en el pastel -->
                    <div
                      class="mx-6 mb-4 rounded-2xl bg-[#FFBEE6]/20 ring-1 ring-[#FFBEE6] px-5 py-5 text-center"
                    >
                      <p
                        v-if="detail.writingText"
                        class="text-[22px] font-bold text-[#111827] italic leading-snug tracking-wide"
                      >
                        "{{ detail.writingText }}"
                      </p>
                      <p v-else class="text-[14px] text-[#C9007C]/50 italic">
                        Sin texto especificado
                      </p>
                      <!-- Detalles de ubicación debajo del texto, separados -->
                      <div
                        v-if="detail.writingLocation || detail.pipingLocation"
                        class="mt-3 flex justify-center flex-wrap gap-3 border-t border-[#FFBEE6] pt-3"
                      >
                        <span
                          v-if="detail.writingLocation"
                          class="inline-flex items-center gap-1.5 text-[12px] text-[#C9007C]"
                        >
                          <span class="font-semibold">Ubicación</span>
                          <span class="opacity-40">·</span>
                          {{ locationLabel(detail.writingLocation) }}
                        </span>
                        <span
                          v-if="detail.pipingLocation"
                          class="inline-flex items-center gap-1.5 text-[12px] text-[#C9007C]"
                        >
                          <span class="font-semibold">Piping</span>
                          <span class="opacity-40">·</span>
                          {{ detail.pipingLocation }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Instrucciones -->
                  <div
                    v-if="detail.decorationNotes || detail.notes"
                    class="border-t border-black/[0.06]"
                  >
                    <div class="flex items-center gap-2 px-6 pt-4 pb-3">
                      <svg
                        class="h-4 w-4 text-gray-400 shrink-0"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                      >
                        <path
                          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span
                        class="text-[11px] font-bold uppercase tracking-widest text-gray-400"
                        >Instrucciones especiales</span
                      >
                    </div>
                    <div class="mx-6 mb-5 space-y-2">
                      <div
                        v-if="detail.decorationNotes"
                        class="rounded-xl bg-gray-50 ring-1 ring-black/[0.07] px-4 py-3"
                      >
                        <p
                          class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1"
                        >
                          Decoración
                        </p>
                        <p class="text-[14px] text-[#111827] leading-relaxed">
                          {{ detail.decorationNotes }}
                        </p>
                      </div>
                      <div
                        v-if="detail.notes"
                        class="rounded-xl bg-gray-50 ring-1 ring-black/[0.07] px-4 py-3"
                      >
                        <p
                          class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1"
                        >
                          Nota
                        </p>
                        <p class="text-[14px] text-[#111827] leading-relaxed">
                          {{ detail.notes }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── FLORES ── -->
            <div v-if="order.orderFlowers && order.orderFlowers.length > 0">
              <div class="flex items-center gap-2 mb-3">
                <h2 class="text-[15px] font-bold text-[#111827]">Flores</h2>
                <span
                  class="rounded-full bg-[#F5E6FA] px-2.5 py-0.5 text-[11px] font-bold text-[#7C00C9]"
                  >{{ order.orderFlowers.length }}</span
                >
              </div>
              <div
                class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.06)] overflow-hidden divide-y divide-black/[0.06]"
              >
                <div
                  v-for="(f, i) in order.orderFlowers"
                  :key="i"
                  class="px-6 py-4 flex items-center gap-4"
                >
                  <span
                    class="inline-block h-10 w-10 rounded-full shrink-0 ring-2 ring-black/10 shadow-sm"
                    :style="{ background: f.color?.value ?? '#e5e7eb' }"
                  />
                  <div class="flex-1 min-w-0">
                    <p class="text-[15px] font-bold text-[#111827] truncate">
                      {{ f.flower?.name ?? "—" }}
                    </p>
                    <p v-if="f.color" class="text-[12px] text-gray-400">
                      {{ f.color.name }}
                    </p>
                    <p
                      v-if="f.notes"
                      class="mt-0.5 text-[12px] text-gray-400 italic"
                    >
                      {{ f.notes }}
                    </p>
                  </div>
                  <span
                    class="shrink-0 rounded-xl bg-[#F5E6FA] px-4 py-2 text-[15px] font-bold text-[#7C00C9]"
                    >× {{ f.quantity }}</span
                  >
                </div>
              </div>
            </div>
          </div>
          <!-- ╚═ /COL IZQUIERDA ════════════════════════════════════════════╝ -->

          <!-- ╔═ COL DERECHA (1/3): entrega + cliente ══════════════════════╗ -->
          <div class="space-y-4 pt-8">
            <!-- Entrega -->
            <div
              class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.06)] overflow-hidden"
            >
              <div
                class="px-5 py-3 border-b border-black/[0.06] flex items-center gap-2"
              >
                <svg
                  class="h-3.5 w-3.5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span
                  class="text-[11px] font-bold tracking-widest text-gray-400 uppercase"
                  >Entrega</span
                >
              </div>
              <div class="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-4">
                <div class="col-span-2">
                  <p class="text-[11px] text-gray-400">Fecha</p>
                  <p class="mt-0.5 text-[18px] font-bold text-[#111827]">
                    {{ formatDate(order.deliveryDate) }}
                  </p>
                </div>
                <div v-if="order.deliveryTime">
                  <p class="text-[11px] text-gray-400">Hora</p>
                  <p class="mt-0.5 text-[15px] font-bold text-[#111827]">
                    {{ order.deliveryTime }}
                  </p>
                </div>
                <div v-if="order.deliveryRound" class="col-span-2">
                  <p class="text-[11px] text-gray-400">Ronda</p>
                  <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">
                    {{ roundLabel(order.deliveryRound) }}
                  </p>
                </div>
                <div v-if="order.eventTime">
                  <p class="text-[11px] text-gray-400">Hora evento</p>
                  <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">
                    {{ order.eventTime }}
                  </p>
                </div>
                <div v-if="order.setupTime">
                  <p class="text-[11px] text-gray-400">Montaje</p>
                  <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">
                    {{ order.setupTime }}
                  </p>
                </div>
                <div v-if="order.branchDepartureTime">
                  <p class="text-[11px] text-gray-400">Salida sucursal</p>
                  <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">
                    {{ order.branchDepartureTime }}
                  </p>
                </div>
                <div v-if="order.guestCount">
                  <p class="text-[11px] text-gray-400">Invitados</p>
                  <p class="mt-0.5 text-[14px] font-semibold text-[#111827]">
                    {{ order.guestCount }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Cliente -->
            <div
              v-if="order.customer"
              class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.06)] overflow-hidden"
            >
              <div
                class="px-5 py-3 border-b border-black/[0.06] flex items-center gap-2"
              >
                <svg
                  class="h-3.5 w-3.5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span
                  class="text-[11px] font-bold tracking-widest text-gray-400 uppercase"
                  >Cliente</span
                >
              </div>
              <div class="px-5 py-4 flex items-center gap-3">
                <div
                  class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#E6ABFA] font-bold text-[14px] text-[#7C00C9]"
                >
                  {{ order.customer.fullName.slice(0, 2).toUpperCase() }}
                </div>
                <div>
                  <p class="text-[15px] font-bold text-[#111827]">
                    {{ order.customer.fullName }}
                  </p>
                  <p
                    v-if="order.customer.phone"
                    class="text-[13px] text-gray-500"
                  >
                    {{ order.customer.phone }}
                  </p>
                  <p
                    v-if="order.customer.notes"
                    class="mt-1 text-[12px] text-gray-400 italic"
                  >
                    {{ order.customer.notes }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Montaje -->
            <div
              v-if="order.setupPersonName"
              class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.06)] px-5 py-4"
            >
              <p
                class="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1"
              >
                Responsable de montaje
              </p>
              <p class="text-[14px] font-semibold text-[#111827]">
                {{ order.setupPersonName }}
              </p>
            </div>
          </div>
          <!-- ╚═ /COL DERECHA ══════════════════════════════════════════════╝ -->
        </div>
      </template>
    </div>
  </section>

  <!-- ── Lightbox ───────────────────────────────────────────────────────── -->
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
        v-if="lightboxSrc"
        class="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
        @wheel.prevent="onWheel"
        @mousedown="onMousedown"
        @mousemove="onMousemove"
        @mouseup="onMouseup"
        @mouseleave="onMouseup"
      >
        <!-- Cerrar al clickar fondo (solo si no hubo drag) -->
        <div class="absolute inset-0" @click.self="closeLightbox" />

        <!-- Imagen -->
        <img
          :src="lightboxSrc"
          alt="Referencia ampliada"
          class="relative max-w-[90vw] max-h-[88vh] rounded-xl object-contain select-none shadow-2xl"
          :style="{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
            transition: dragging ? 'none' : 'transform 0.15s ease',
          }"
          draggable="false"
          @click.stop="zoom === 1 ? (zoom = 2) : resetZoom()"
        />

        <!-- Controles -->
        <div
          class="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2"
        >
          <button
            class="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 transition"
            @click.stop="
              zoom = Math.max(1, zoom - 0.5);
              if (zoom === 1) pan = { x: 0, y: 0 };
            "
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M5 12h14" />
            </svg>
          </button>
          <span
            class="text-white/70 text-[12px] font-semibold tabular-nums w-10 text-center"
            >{{ Math.round(zoom * 100) }}%</span
          >
          <button
            class="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 transition"
            @click.stop="zoom = Math.min(5, zoom + 0.5)"
          >
            <svg
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <button
            class="ml-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 transition"
            @click.stop="resetZoom"
          >
            <svg
              class="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M4 4l16 16M20 4L4 20" />
            </svg>
          </button>
        </div>

        <!-- Cerrar X -->
        <button
          class="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white p-2.5 transition"
          @click.stop="closeLightbox"
        >
          <svg
            class="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <!-- Hint primera vez -->
        <p
          class="absolute top-5 left-1/2 -translate-x-1/2 text-white/40 text-[11px] select-none pointer-events-none"
        >
          Scroll o click para zoom · Arrastra para mover
        </p>
      </div>
    </Transition>
  </Teleport>

  <!-- ── Modal de confirmación ─────────────────────────────────────────── -->
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
        v-if="confirmOpen"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="confirmOpen = false"
        />

        <!-- Panel -->
        <div
          class="relative z-10 w-full max-w-[380px] rounded-3xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.08] overflow-hidden"
        >
          <!-- Icono centrado -->
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
              Cambiar estado del pedido
            </h3>
            <p class="mt-1.5 text-[13px] text-gray-500 leading-relaxed">
              <span class="font-semibold text-[#111827]">{{
                order?.orderCode
              }}</span>
              pasará de
            </p>
            <!-- Flecha de estado -->
            <div class="mt-3 flex items-center justify-center gap-2.5">
              <span
                class="inline-flex rounded-full px-3 py-1 text-[12px] font-bold"
                :style="{
                  backgroundColor:
                    STATUS_COLORS[order!.status as OrderStatus]?.bg,
                  color: STATUS_COLORS[order!.status as OrderStatus]?.text,
                }"
                >{{ STATUS_LABELS[order!.status as OrderStatus] }}</span
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
                >{{ advanceNextLabel }}</span
              >
            </div>
          </div>

          <!-- Separador -->
          <div class="mx-6 border-t border-black/[0.06]" />

          <!-- Botones -->
          <div class="flex gap-3 px-6 py-5">
            <button
              type="button"
              class="flex-1 rounded-2xl border border-black/10 py-3 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition"
              @click="confirmOpen = false"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="flex-1 rounded-2xl py-3 text-[13px] font-bold bg-[#C9007C] text-white hover:bg-[#a5006a] transition shadow-sm"
              @click="advance"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
