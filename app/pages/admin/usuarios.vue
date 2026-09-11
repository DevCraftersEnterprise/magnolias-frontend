<script setup lang="ts">
import { usersService } from "~/services/users.service";
import type { UserItem, UserRole } from "~/types/user.types";
import { useToast } from "vue-toastification";

definePageMeta({ layout: "admin", pageTitle: "Usuarios" });
useHead({ title: "Usuarios · Magnolias" });

// ─── State ───────────────────────────────────────────────────────────────────
const loading = ref(true);
const toast = useToast();
const users = ref<UserItem[]>([]);
const roleFilter = ref<UserRole | "">("");

// ─── Pagination & search ─────────────────────────────────────────────────────
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
} = usePagination(loadUsers);

const {
  query: searchQuery,
  debouncedQuery,
  clear: clearSearch,
} = useDebounceSearch(() => loadUsers(true));

// ─── Load ────────────────────────────────────────────────────────────────────
async function loadUsers(shouldReset = false) {
  loading.value = true;
  try {
    if (shouldReset) {
      reset();
      users.value = [];
    }

    const data = await usersService.getUsers({
      username: debouncedQuery.value || undefined,
      role: roleFilter.value || undefined,
      limit: pagination.value.limit,
      offset: pagination.value.offset,
    });

    users.value = data.items ?? [];
    update(data.pagination, data.total);
  } catch (e: any) {
    toast.error(e?.message || "Ocurrió un error cargando usuarios.");
  } finally {
    loading.value = false;
  }
}

// ─── Lifecycle & watchers ────────────────────────────────────────────────────
watch(roleFilter, () => loadUsers(true));
onMounted(() => loadUsers(true));

// ─── Modals ──────────────────────────────────────────────────────────────────
const createOpen = ref(false);
const editingUser = ref<UserItem | null>(null);

function onUserCreated(_user: UserItem) {
  loadUsers(true);
}

// ─── Role helpers ────────────────────────────────────────────────────────────
const roleLabels: Record<string, string> = {
  SUPER: "Super",
  ADMIN: "Admin",
  EMPLOYEE: "Sucursal",
  BAKER: "Pastelero",
};

function roleLabel(r: string) {
  return roleLabels[r] ?? r;
}

const roleBadgeClass: Record<string, string> = {
  SUPER: "bg-purple-100 text-purple-700",
  ADMIN: "bg-pink-100 text-pink-700",
  EMPLOYEE: "bg-blue-100 text-blue-700",
  BAKER: "bg-amber-100 text-amber-700",
};

function roleBadge(r: string) {
  return roleBadgeClass[r] ?? "bg-black/8 text-black/60";
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
              <h2 class="text-[20px] font-semibold text-[#111827]">Usuarios</h2>
              <button
                type="button"
                class="grid h-9 w-9 place-items-center rounded-xl bg-white ring-1 ring-black/10 text-[#111827] hover:bg-black/5 transition"
                @click="createOpen = true"
                aria-label="Agregar usuario"
                title="Agregar usuario"
              >
                <span class="text-[18px] leading-none">+</span>
              </button>
            </div>
            <div class="flex items-center gap-3 flex-wrap">
              <!-- Filtro rol -->
              <div class="relative">
                <select
                  v-model="roleFilter"
                  class="h-10 appearance-none rounded-xl bg-white pl-3 pr-9 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/10"
                >
                  <option value="">Todos los roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="EMPLOYEE">Sucursal</option>
                  <option value="BAKER">Pastelero</option>
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

              <!-- Buscador -->
              <AdminSearchInput
                v-model="searchQuery"
                placeholder="Buscar por usuario"
                class="w-[280px] max-w-[46vw]"
                @clear="clearSearch"
              />
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="px-6 py-5">
          <div
            v-if="loading"
            class="py-12 text-center text-[13px] text-gray-500"
          >
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
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[22%]"
                      >
                        Nombre
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[18%]"
                      >
                        Usuario
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[14%]"
                      >
                        Rol
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[20%]"
                      >
                        Área
                      </th>
                      <th
                        class="px-4 py-3 text-[12px] font-semibold text-gray-600 w-[14%]"
                      >
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="u in users"
                      :key="u.id"
                      class="border-b border-black/5 last:border-b-0 hover:bg-[#FAFAFB] transition cursor-pointer"
                      @dblclick="editingUser = u"
                    >
                      <td class="px-4 py-3 text-[13px] text-[#111827] truncate">
                        {{ u.name }} {{ u.lastname }}
                      </td>
                      <td class="px-4 py-3 text-[13px] text-gray-700 truncate">
                        {{ u.username }}
                      </td>
                      <td class="px-4 py-3">
                        <span
                          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                          :class="roleBadge(u.role)"
                        >
                          {{ roleLabel(u.role) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-[13px] text-gray-700 truncate">
                        {{ u.area || "—" }}
                      </td>
                      <td class="px-4 py-3">
                        <AdminStatusBadge :is-active="u.isActive" />
                      </td>
                    </tr>
                    <tr v-if="users.length === 0">
                      <td
                        colspan="5"
                        class="px-4 py-10 text-center text-[13px] text-gray-500"
                      >
                        No hay usuarios para mostrar.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Cards móvil -->
            <div class="sm:hidden space-y-3">
              <button
                v-for="u in users"
                :key="u.id"
                type="button"
                class="block w-full text-left rounded-2xl bg-white ring-1 ring-black/10 p-4 cursor-pointer active:bg-black/5 transition"
                :aria-label="`Editar usuario ${u.name} ${u.lastname}`"
                @click="editingUser = u"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <p class="text-[14px] font-semibold text-[#111827]">
                      {{ u.name }} {{ u.lastname }}
                    </p>
                    <p class="text-[13px] text-gray-500 mt-0.5">
                      @{{ u.username }}
                    </p>
                  </div>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold shrink-0"
                    :class="roleBadge(u.role)"
                  >
                    {{ roleLabel(u.role) }}
                  </span>
                </div>
                <div class="mt-3 space-y-1.5 text-[13px]">
                  <div class="flex gap-2">
                    <span class="text-gray-400 w-16 shrink-0">Área</span
                    ><span class="text-gray-700">{{ u.area || "—" }}</span>
                  </div>

                  <div class="flex gap-2">
                    <span class="text-gray-400 w-16 shrink-0">Estado</span>
                    <AdminStatusBadge :is-active="u.isActive" />
                  </div>
                </div>
              </button>
              <div
                v-if="users.length === 0"
                class="rounded-2xl bg-white ring-1 ring-black/10 p-6 text-center text-[13px] text-gray-500"
              >
                No hay usuarios para mostrar.
              </div>
            </div>

            <!-- Paginación -->
            <AdminPaginationBar
              :from="showingFrom(users.length)"
              :to="showingTo(users.length)"
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

  <UserCreateModal
    v-if="createOpen"
    mode="create"
    @close="createOpen = false"
    @created="onUserCreated"
  />

  <UserCreateModal
    v-if="editingUser"
    mode="edit"
    :user="editingUser"
    @close="editingUser = null"
    @saved="loadUsers(false)"
  />
</template>
