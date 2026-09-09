<script setup lang="ts">
import { branchEmployeesService } from "~/services/branch-employees.service";
import type { BranchEmployeeItem } from "~/types/branch-employee.types";
import { useToast } from "vue-toastification";

definePageMeta({ layout: "admin", pageTitle: "Empleados" });
useHead({ title: "Empleados · Magnolias" });

const { selectedBranch } = useBranch();
const loading = ref(true);
const toast = useToast();
const employees = ref<BranchEmployeeItem[]>([]);

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
} = usePagination(loadEmployees);

// Evita que una respuesta atrasada de una sucursal anterior sobrescriba
// la lista si el admin cambia de sucursal antes de que llegue la respuesta.
let loadRequestId = 0;

async function loadEmployees(shouldReset = false) {
  const branchId = selectedBranch.value?.id;

  if (!branchId) {
    loadRequestId += 1;
    employees.value = [];
    loading.value = false;
    return;
  }

  const requestId = ++loadRequestId;

  loading.value = true;
  try {
    if (shouldReset) {
      reset();
      employees.value = [];
    }

    const data = await branchEmployeesService.getBranchEmployees(
      branchId,
      pagination.value.limit,
      pagination.value.offset,
    );

    // Si mientras tanto se disparó otra carga (cambio de sucursal o
    // paginación), esta respuesta ya está obsoleta: se descarta.
    if (requestId !== loadRequestId) return;

    employees.value = data.items ?? [];
    update(data.pagination, data.total);
  } catch (e: any) {
    if (requestId !== loadRequestId) return;
    toast.error(e?.message || "Ocurrió un error cargando empleados.");
  } finally {
    if (requestId === loadRequestId) loading.value = false;
  }
}

watch(selectedBranch, () => loadEmployees(true));
onMounted(() => loadEmployees(true));

const createOpen = ref(false);
const editingEmployee = ref<BranchEmployeeItem | null>(null);

function onEmployeeCreated(_employee: BranchEmployeeItem) {
  loadEmployees(true);
}

// ─── Regenerar PIN ────────────────────────────────────────────────────────────
const regenerateConfirmOpen = ref(false);
const regenerateTarget = ref<BranchEmployeeItem | null>(null);
const regenerating = ref(false);
const regeneratedPin = ref<string | null>(null);
const regeneratedPinEmployee = ref<string | null>(null);

function confirmRegeneratePin(e: BranchEmployeeItem) {
  regenerateTarget.value = e;
  regenerateConfirmOpen.value = true;
}

async function executeRegeneratePin() {
  if (!regenerateTarget.value || regenerating.value) return;
  regenerating.value = true;
  try {
    const res = await branchEmployeesService.regeneratePin(
      regenerateTarget.value.id,
    );
    regeneratedPin.value = res.pin;
    regeneratedPinEmployee.value = `${regenerateTarget.value.name} ${regenerateTarget.value.lastname}`;
    regenerateConfirmOpen.value = false;
    regenerateTarget.value = null;
  } catch (e: any) {
    toast.error(e?.message || "No se pudo regenerar el PIN.");
    regenerateConfirmOpen.value = false;
  } finally {
    regenerating.value = false;
  }
}

async function copyRegeneratedPin() {
  if (!regeneratedPin.value) return;
  try {
    await navigator.clipboard.writeText(regeneratedPin.value);
    toast.success("PIN copiado.");
  } catch {
    /* portapapeles no disponible */
  }
}
</script>

<template>
  <section class="min-h-[calc(100vh-64px)] bg-[#F3F3F4] font-sans">
    <div class="mx-auto w-full max-w-[1220px] px-4 py-6 lg:px-10 lg:py-8">
      <div
        class="rounded-2xl bg-white ring-1 ring-black/10 shadow-[0_10px_28px_rgba(16,24,40,0.08)] overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-5 border-b border-black/10">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <h2 class="text-[20px] font-semibold text-[#111827]">
                Empleados
              </h2>
              <button
                type="button"
                class="grid h-9 w-9 place-items-center rounded-xl bg-white ring-1 ring-black/10 text-[#111827] hover:bg-black/5 transition disabled:opacity-40"
                :disabled="!selectedBranch"
                @click="createOpen = true"
                aria-label="Agregar empleado"
                title="Agregar empleado"
              >
                <span class="text-[18px] leading-none">+</span>
              </button>
            </div>
            <p v-if="selectedBranch" class="text-[13px] text-gray-400">
              Sucursal: <span class="font-semibold">{{ selectedBranch.name }}</span>
            </p>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5">
          <div
            v-if="!selectedBranch"
            class="py-12 text-center text-[13px] text-gray-500"
          >
            Selecciona una sucursal en la barra superior para ver sus
            empleados.
          </div>

          <div v-else-if="loading" class="py-12 text-center text-[13px] text-gray-500">
            Cargando…
          </div>

          <div v-else>
            <!-- Tabla escritorio -->
            <div
              class="hidden sm:block rounded-xl ring-1 ring-black/10 overflow-hidden"
            >
              <div class="overflow-x-auto">
                <table class="min-w-full text-left table-fixed">
                  <thead class="bg-white">
                    <tr class="border-b border-black/10">
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[40%]"
                      >
                        Nombre
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[30%]"
                      >
                        Registrado
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[20%]"
                      >
                        Estado
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[10%]"
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="e in employees"
                      :key="e.id"
                      class="border-b border-black/5 last:border-b-0 hover:bg-[#FAFAFB] transition cursor-pointer"
                      @dblclick="editingEmployee = e"
                    >
                      <td class="px-4 py-3 text-[13px] text-[#111827] truncate">
                        {{ e.name }} {{ e.lastname }}
                      </td>
                      <td class="px-4 py-3 text-[13px] text-gray-700 truncate">
                        {{ new Date(e.createdAt).toLocaleDateString("es-MX") }}
                      </td>
                      <td class="px-4 py-3">
                        <AdminStatusBadge :is-active="e.isActive" />
                      </td>
                      <td class="px-4 py-3 text-right">
                        <button
                          type="button"
                          class="text-[12px] font-semibold text-[#C9007C] hover:underline"
                          @click.stop="confirmRegeneratePin(e)"
                        >
                          Regenerar PIN
                        </button>
                      </td>
                    </tr>
                    <tr v-if="employees.length === 0">
                      <td
                        colspan="4"
                        class="px-4 py-10 text-center text-[13px] text-gray-500"
                      >
                        No hay empleados registrados en esta sucursal.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Cards móvil -->
            <div class="sm:hidden space-y-3">
              <div
                v-for="e in employees"
                :key="e.id"
                class="rounded-2xl bg-white ring-1 ring-black/10 p-4 cursor-pointer active:bg-black/5 transition"
                @click="editingEmployee = e"
              >
                <div class="flex items-start justify-between gap-2">
                  <p class="text-[14px] font-semibold text-[#111827]">
                    {{ e.name }} {{ e.lastname }}
                  </p>
                  <AdminStatusBadge :is-active="e.isActive" />
                </div>
                <p class="mt-1 text-[12px] text-gray-400">
                  Registrado: {{ new Date(e.createdAt).toLocaleDateString("es-MX") }}
                </p>
                <button
                  type="button"
                  class="mt-2 text-[12px] font-semibold text-[#C9007C] hover:underline"
                  @click.stop="confirmRegeneratePin(e)"
                >
                  Regenerar PIN
                </button>
              </div>
              <div
                v-if="employees.length === 0"
                class="rounded-2xl bg-white ring-1 ring-black/10 p-6 text-center text-[13px] text-gray-500"
              >
                No hay empleados registrados en esta sucursal.
              </div>
            </div>

            <!-- Paginación -->
            <AdminPaginationBar
              :from="showingFrom(employees.length)"
              :to="showingTo(employees.length)"
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
  </section>

  <BranchEmployeeCreateModal
    v-if="createOpen && selectedBranch"
    mode="create"
    :branch-id="selectedBranch.id"
    @close="createOpen = false"
    @created="onEmployeeCreated"
  />

  <BranchEmployeeCreateModal
    v-if="editingEmployee && selectedBranch"
    mode="edit"
    :branch-id="selectedBranch.id"
    :employee="editingEmployee"
    @close="editingEmployee = null"
    @saved="loadEmployees(false)"
  />

  <UiConfirmModal
    v-model="regenerateConfirmOpen"
    title="Regenerar PIN"
    :message="`Se generará un PIN nuevo para ${regenerateTarget?.name} ${regenerateTarget?.lastname}. El PIN anterior dejará de funcionar de inmediato.`"
    @confirm="executeRegeneratePin"
  />

  <UiBaseModal :model-value="!!regeneratedPin" @update:model-value="regeneratedPin = null">
    <template #title>PIN regenerado</template>
    <template #subtitle
      >Comparte este PIN con {{ regeneratedPinEmployee }}. No podrás volver a
      verlo después de cerrar esta ventana.</template
    >

    <div class="flex flex-col items-center gap-4 py-2">
      <p
        class="text-[32px] font-bold tracking-[0.3em] text-[#111827] bg-gray-100 rounded-xl px-6 py-3"
      >
        {{ regeneratedPin }}
      </p>
      <button
        type="button"
        class="text-[13px] font-semibold text-[#C9007C] hover:underline"
        @click="copyRegeneratedPin"
      >
        Copiar PIN
      </button>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <button
          type="button"
          class="h-10 rounded-lg px-4 text-[13px] font-semibold bg-[#1F1F1F] text-white hover:bg-black transition"
          @click="regeneratedPin = null"
        >
          Listo
        </button>
      </div>
    </template>
  </UiBaseModal>
</template>
