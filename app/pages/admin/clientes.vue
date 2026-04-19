<script setup lang="ts">
definePageMeta({ layout: "admin", pageTitle: "Clientes" });
useHead({ title: "Clientes · Magnolias" });

// ✅ ESTE es el payload real del POST
import { customersService } from "~/services/customers.service";
import { type CustomerCreateForm } from "~/components/modals/CustomerCreateModal.vue";
import type {
  CreateCustomerRequest,
  CustomerItem,
  UpdateCustomerRequest,
} from "~/types/customer.types";

const loading = ref(true);
const errorMsg = ref("");

const customers = ref<CustomerItem[]>([]);

const {
  pagination,
  update,
  reset,
  canPrev,
  canNext,
  showingFrom,
  showingTo,
  prevPage,
  nextPage,
} = usePagination(loadCustomers);

/** ===== Buscador (teléfono) ===== */
function normalizePhoneQuery(input: string) {
  const s = (input ?? "").trim();
  return s ? s.replace(/\D/g, "") : "";
}

const {
  query: phoneQuery,
  debouncedQuery: debouncedPhone,
  clear: clearSearch,
} = useDebounceSearch(() => loadCustomers(true), 350, normalizePhoneQuery);

/** ===== Carga ===== */
async function loadCustomers(shouldReset = false) {
  loading.value = true;
  errorMsg.value = "";

  try {
    if (shouldReset) {
      reset();
      customers.value = [];
    }

    const data = await customersService.getCustomers({
      phone: debouncedPhone.value || undefined,
      isActive: true,
      limit: pagination.value.limit,
      offset: pagination.value.offset,
    });

    customers.value = (data.items ?? []).filter((x) => x.isActive);
    update(data.pagination, data.total);
  } catch (e: any) {
    console.error(e);
    errorMsg.value = e?.message || "Ocurrió un error cargando clientes.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => loadCustomers(true));

/** ===== Helpers UI ===== */
function shortText(v: string | null | undefined, max = 32) {
  if (!v) return "—";
  const s = String(v);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

/** ===== Modal "ver más" ===== */
const detailOpen = ref(false);
const detailTitle = ref("");
const detailText = ref("");

function openDetail(title: string, text: string) {
  detailTitle.value = title;
  detailText.value = text;
  detailOpen.value = true;
}

/** ===== Crear cliente (REAL) ===== */
const createOpen = ref(false);
const createSaving = ref(false);
const createError = ref("");

const createModel = ref<CustomerCreateForm | null>(null);

function openCreate() {
  createError.value = "";
  createModel.value = {
    fullName: "",
    phone: "",
    alternativePhone: "",
    email: "",
    notes: "",
    withAddress: false,
    address: {
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      postalCode: "",
      interphoneCode: "",
      betweenStreets: "",
      reference: "",
      notes: "",
    },
  };
  createOpen.value = true;
}

function toNullIfEmpty(v: string | null | undefined) {
  const s = (v ?? "").trim();
  return s ? s : null;
}

async function onCreateSave(model: CustomerCreateForm) {
  createSaving.value = true;
  createError.value = "";
  try {
    // ✅ Validaciones obligatorias
    if (!model.fullName.trim()) throw new Error("El nombre es obligatorio.");
    if (!model.phone.trim()) throw new Error("El teléfono es obligatorio.");

    // ✅ Si activó dirección, obligatorios: calle, número, colonia
    if (model.withAddress) {
      if (!model.address.street.trim())
        throw new Error("La calle es obligatoria.");
      if (!model.address.number.trim())
        throw new Error("El número es obligatorio.");
      if (!model.address.neighborhood.trim())
        throw new Error("La colonia es obligatoria.");
    }

    // ✅ Convertimos FORM -> REQUEST (payload del POST)
    const payload: CreateCustomerRequest = {
      fullName: model.fullName.trim(),
      phone: model.phone.trim(),
      alternativePhone: toNullIfEmpty(model.alternativePhone),
      email: toNullIfEmpty(model.email),
      notes: toNullIfEmpty(model.notes),

      address: model.withAddress
        ? {
            street: model.address.street.trim(),
            number: model.address.number.trim(),
            neighborhood: model.address.neighborhood.trim(),
            city: toNullIfEmpty(model.address.city),
            postalCode: toNullIfEmpty(model.address.postalCode),
            interphoneCode: toNullIfEmpty(model.address.interphoneCode),
            betweenStreets: toNullIfEmpty(model.address.betweenStreets),
            reference: toNullIfEmpty(model.address.reference),
            notes: toNullIfEmpty(model.address.notes),
          }
        : null,
    };

    await customersService.createCustomer(payload);

    createOpen.value = false;
    await loadCustomers(true); // recarga lista desde página 1
  } catch (e: any) {
    console.error(e);
    createError.value = e?.message || "No se pudo crear el cliente.";
  } finally {
    createSaving.value = false;
  }
}

const editOpen = ref(false);
const editSaving = ref(false);
const editError = ref("");
const editingId = ref<string | null>(null);

const editModel = ref<CustomerCreateForm | null>(null);

function safeStr(v: any) {
  return (v ?? "").toString();
}

function openEdit(c: CustomerItem) {
  editError.value = "";
  editingId.value = c.id;

  const hasAddress = !!c.address;

  editModel.value = {
    fullName: safeStr(c.fullName),
    phone: safeStr(c.phone),
    alternativePhone: safeStr(c.alternativePhone),
    email: safeStr(c.email),
    notes: safeStr(c.notes),
    withAddress: hasAddress,
    address: {
      street: safeStr(c.address?.street),
      number: safeStr(c.address?.number),
      neighborhood: safeStr(c.address?.neighborhood),
      city: safeStr(c.address?.city),
      postalCode: safeStr(c.address?.postalCode),
      interphoneCode: safeStr(c.address?.interphoneCode),
      betweenStreets: safeStr(c.address?.betweenStreets),
      reference: safeStr(c.address?.reference),
      notes: safeStr(c.address?.notes),
    },
  };

  editOpen.value = true;
}

async function onEditSave(model: CustomerCreateForm) {
  if (!editingId.value) return;
  editSaving.value = true;
  editError.value = "";

  try {
    // Validaciones obligatorias (igual que create)
    if (!model.fullName.trim()) throw new Error("El nombre es obligatorio.");
    if (!model.phone.trim()) throw new Error("El teléfono es obligatorio.");

    if (model.withAddress) {
      if (!model.address.street.trim())
        throw new Error("La calle es obligatoria.");
      if (!model.address.number.trim())
        throw new Error("El número es obligatorio.");
      if (!model.address.neighborhood.trim())
        throw new Error("La colonia es obligatoria.");
    }

    const payload: UpdateCustomerRequest = {
      fullName: model.fullName.trim(),
      phone: model.phone.trim(),
      alternativePhone: toNullIfEmpty(model.alternativePhone),
      email: toNullIfEmpty(model.email),
      notes: toNullIfEmpty(model.notes),
      isActive: true, // si quieres mantenerlo siempre activo al editar (si no, quítalo)
      address: model.withAddress
        ? {
            street: model.address.street.trim(),
            number: model.address.number.trim(),
            neighborhood: model.address.neighborhood.trim(),
            city: toNullIfEmpty(model.address.city),
            postalCode: toNullIfEmpty(model.address.postalCode),
            interphoneCode: toNullIfEmpty(model.address.interphoneCode),
            betweenStreets: toNullIfEmpty(model.address.betweenStreets),
            reference: toNullIfEmpty(model.address.reference),
            notes: toNullIfEmpty(model.address.notes),
          }
        : null, // si apagó toggle, borra dirección
    };

    await customersService.updateCustomer(editingId.value, payload);

    editOpen.value = false;
    editingId.value = null;
    await loadCustomers(false); // recarga página actual sin resetear offset
  } catch (e: any) {
    console.error(e);
    editError.value = e?.message || "No se pudo actualizar el cliente.";
  } finally {
    editSaving.value = false;
  }
}
const deleteConfirmOpen = ref(false);
const deleteSaving = ref(false);
const deleteError = ref("");
function onEditDelete() {
  deleteError.value = "";
  deleteConfirmOpen.value = true;
}
async function confirmDelete() {
  if (!editingId.value) return;
  deleteSaving.value = true;
  deleteError.value = "";

  try {
    await customersService.deleteCustomer(editingId.value);

    // cerrar todo y refrescar
    deleteConfirmOpen.value = false;
    editOpen.value = false;
    editingId.value = null;

    await loadCustomers(false);
  } catch (e: any) {
    console.error(e);
    deleteError.value = e?.message || "No se pudo eliminar el cliente.";
  } finally {
    deleteSaving.value = false;
  }
}
</script>

<template>
  <section class="min-h-[calc(100vh-64px)] bg-[#F3F3F4] font-sans">
    <div class="mx-auto w-full max-w-[1220px] px-4 py-6 lg:px-10 lg:py-8">
      <!-- Card principal (como en tu mock) -->
      <div
        class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden"
      >
        <!-- Header: Registros + buscador EN LA MISMA LÍNEA -->
        <div class="px-6 py-5 border-b border-black/10">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <h2 class="text-[20px] font-semibold text-[#111827]">
                Registros
              </h2>

              <button
                type="button"
                class="grid h-9 w-9 place-items-center rounded-xl bg-white ring-1 ring-black/10 text-[#111827] hover:bg-black/5 transition"
                @click="openCreate"
                aria-label="Agregar cliente"
                title="Agregar cliente"
              >
                <span class="text-[18px] leading-none">+</span>
              </button>
            </div>

            <!-- Search (derecha, como en la imagen) -->
            <AdminSearchInput
              v-model="phoneQuery"
              placeholder="Buscar por teléfono"
              inputmode="numeric"
              class="w-[360px] max-w-[46vw]"
              @clear="clearSearch"
            />
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5">
          <div
            v-if="errorMsg"
            class="mb-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] text-red-700 ring-1 ring-red-200"
          >
            {{ errorMsg }}
          </div>

          <div
            v-if="loading"
            class="py-12 text-center text-[13px] text-gray-500"
          >
            Cargando…
          </div>

          <div v-else>
            <!-- ===== WEB: TABLA SIEMPRE (desde sm+) ===== -->
            <div
              class="hidden sm:block rounded-xl ring-1 ring-black/10 bg-white overflow-hidden"
            >
              <div class="overflow-x-auto">
                <table class="min-w-full text-left table-fixed">
                  <thead class="bg-white">
                    <tr class="border-b border-black/10">
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[26%]"
                      >
                        Nombre
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[16%]"
                      >
                        Teléfono
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[20%]"
                      >
                        Correo
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[22%]"
                      >
                        Dirección
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[16%]"
                      >
                        Notas
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="c in customers"
                      :key="c.id"
                      class="border-b border-black/5 last:border-b-0 hover:bg-[#FAFAFB] transition cursor-pointer"
                      @dblclick="openEdit(c)"
                    >
                      <td class="px-4 py-3 text-[13px] text-[#111827] truncate">
                        {{ c.fullName }}
                      </td>

                      <td
                        class="px-4 py-3 text-[13px] text-[#111827] whitespace-nowrap"
                      >
                        {{ c.phone }}
                      </td>

                      <td class="px-4 py-3 text-[13px] text-gray-700 truncate">
                        {{ c.email || "—" }}
                      </td>

                      <td class="px-4 py-3 text-[13px] text-gray-700">
                        <div class="flex items-center gap-2">
                          <span class="truncate max-w-[260px]">{{
                            shortText(formatAddress(c), 36)
                          }}</span>
                          <button
                            v-if="
                              formatAddress(c) !== '—' &&
                              formatAddress(c).length > 36
                            "
                            class="shrink-0 text-[12px] font-semibold text-[#111827] hover:underline"
                            type="button"
                            @click="openDetail('Dirección', formatAddress(c))"
                          >
                            Ver más…
                          </button>
                        </div>
                      </td>

                      <td class="px-4 py-3 text-[13px] text-gray-700">
                        <div class="flex items-center gap-2">
                          <span class="truncate max-w-[180px]">{{
                            shortText(c.notes, 24)
                          }}</span>
                          <button
                            v-if="(c.notes || '').length > 24"
                            class="shrink-0 text-[12px] font-semibold text-[#111827] hover:underline"
                            type="button"
                            @click="openDetail('Notas', c.notes || '')"
                          >
                            Ver más…
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr v-if="customers.length === 0">
                      <td
                        colspan="5"
                        class="px-4 py-10 text-center text-[13px] text-gray-500"
                      >
                        No hay clientes para mostrar.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- ===== MÓVIL REAL: CARDS (solo < sm) ===== -->
            <div class="sm:hidden space-y-3">
              <div
                v-for="c in customers"
                :key="c.id"
                class="rounded-2xl bg-white ring-1 ring-black/10 p-4 cursor-pointer active:scale-[0.99] transition"
                role="button"
                tabindex="0"
                @click="openEdit(c)"
              >
                <p class="text-[14px] font-semibold text-[#111827]">
                  {{ c.fullName }}
                </p>
                <p class="text-[13px] text-gray-600 mt-0.5">{{ c.phone }}</p>

                <div class="mt-3 space-y-2 text-[13px]">
                  <div>
                    <p class="text-gray-400">Correo</p>
                    <p class="text-gray-700">{{ c.email || "—" }}</p>
                  </div>

                  <div>
                    <p class="text-gray-400">Dirección</p>
                    <div class="flex items-center gap-2">
                      <p class="text-gray-700">
                        {{ shortText(formatAddress(c), 70) }}
                      </p>
                      <button
                        v-if="
                          formatAddress(c) !== '—' &&
                          formatAddress(c).length > 70
                        "
                        class="text-[12px] font-semibold text-[#111827] hover:underline"
                        type="button"
                        @click="openDetail('Dirección', formatAddress(c))"
                      >
                        Ver más…
                      </button>
                    </div>
                  </div>

                  <div>
                    <p class="text-gray-400">Notas</p>
                    <div class="flex items-center gap-2">
                      <p class="text-gray-700">{{ shortText(c.notes, 90) }}</p>
                      <button
                        v-if="(c.notes || '').length > 90"
                        class="text-[12px] font-semibold text-[#111827] hover:underline"
                        type="button"
                        @click="openDetail('Notas', c.notes || '')"
                      >
                        Ver más…
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="customers.length === 0"
                class="rounded-2xl bg-white ring-1 ring-black/10 p-6 text-center text-[13px] text-gray-500"
              >
                No hay clientes para mostrar.
              </div>
            </div>

            <!-- Footer: paginación -->
            <AdminPaginationBar
              :from="showingFrom(customers.length)"
              :to="showingTo(customers.length)"
              :total="pagination.total"
              :current-page="pagination.currentPage"
              :total-pages="pagination.totalPages"
              :can-prev="canPrev"
              :can-next="canNext"
              @prev="prevPage"
              @next="nextPage"
            />
          </div>
        </div>
      </div>
    </div>

    <UiConfirmModal
      v-model="detailOpen"
      :title="detailTitle"
      :message="detailText"
      @confirm="detailOpen = false"
    />

    <ModalsCustomerCreateModal
      v-model="createOpen"
      :model="createModel"
      title="Agregar cliente"
      :saving="createSaving"
      :error="createError"
      @save="onCreateSave"
    />

    <ModalsCustomerCreateModal
      v-model="editOpen"
      :model="editModel"
      title="Editar cliente"
      mode="edit"
      :saving="editSaving"
      :error="editError"
      @save="onEditSave"
      @delete="onEditDelete"
    />

    <UiConfirmModal
      v-model="deleteConfirmOpen"
      title="Eliminar cliente"
      message="Este cliente se eliminará (quedará inactivo). ¿Deseas continuar?"
      @confirm="confirmDelete"
    />
  </section>
</template>
