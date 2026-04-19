<template>
  <UiBaseModal :model-value="true" @update:model-value="emit('close')">
    <template #title>{{
      mode === "create" ? "Agregar usuario" : "Editar usuario"
    }}</template>
    <template #subtitle>{{ roleSubtitle }}</template>
    <form @submit.prevent="onSubmit" class="space-y-4">
      <!-- Nombre y apellido -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-semibold text-black/60">Nombre</label>
          <input
            v-model="form.name"
            class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="John"
            required
          />
        </div>
        <div>
          <label class="text-xs font-semibold text-black/60">Apellido</label>
          <input
            v-model="form.lastname"
            class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <!-- Usuario y contraseña -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-semibold text-black/60">Usuario</label>
          <input
            v-model="form.username"
            class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="johndoe"
            required
          />
        </div>
        <div>
          <label class="text-xs font-semibold text-black/60">
            {{ mode === "create" ? "Contraseña" : "Nueva contraseña" }}
            <span v-if="mode === 'edit'" class="font-normal text-black/40"
              >(opcional)</span
            >
          </label>
          <div class="relative mt-1">
            <input
              v-model="form.userkey"
              :type="showPassword ? 'text' : 'password'"
              class="h-11 w-full rounded-xl bg-black/5 px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-black/10"
              placeholder="••••••"
              :required="mode === 'create'"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black/70 transition"
              @click="showPassword = !showPassword"
              tabindex="-1"
              :aria-label="
                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
              "
            >
              <!-- Ojo abierto -->
              <svg
                v-if="showPassword"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <!-- Ojo cerrado -->
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 012.255-3.592M6.228 6.228A9.97 9.97 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.97 9.97 0 01-4.254 5.275M3 3l18 18"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Rol -->
      <div>
        <label class="text-xs font-semibold text-black/60">Rol</label>
        <div class="relative mt-1">
          <select
            v-model="form.role"
            class="h-11 w-full appearance-none rounded-xl bg-black/5 px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-black/10"
            required
          >
            <option value="" disabled>Selecciona un rol</option>
            <option value="ADMIN">Admin</option>
            <option value="EMPLOYEE">Empleado</option>
            <option value="BAKER">Pastelero</option>
            <option value="ASSISTANT">Asistente</option>
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

      <!-- === EMPLOYEE: solo branchId === -->
      <template v-if="form.role === 'EMPLOYEE'">
        <div>
          <label class="text-xs font-semibold text-black/60">Sucursal</label>
          <div class="relative mt-1">
            <select
              v-model="form.branchId"
              class="h-11 w-full appearance-none rounded-xl bg-black/5 px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-black/10"
              required
            >
              <option value="" disabled>Selecciona una sucursal</option>
              <option v-for="b in branches" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
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
      </template>

      <!-- === BAKER: branchIds (múltiple) + area + specialty === -->
      <template v-else-if="form.role === 'BAKER'">
        <div>
          <label class="text-xs font-semibold text-black/60">
            Sucursales
            <span class="font-normal text-black/40"
              >(puedes elegir varias)</span
            >
          </label>
          <div
            class="mt-1 rounded-xl bg-black/5 p-3 space-y-2 max-h-40 overflow-y-auto"
          >
            <label
              v-for="b in branches"
              :key="b.id"
              class="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                :value="b.id"
                v-model="form.branchIds"
                class="h-4 w-4 rounded accent-pink-400"
              />
              <span class="text-sm text-[#111827]">{{ b.name }}</span>
            </label>
            <p v-if="branches.length === 0" class="text-xs text-black/40">
              Cargando sucursales…
            </p>
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-black/60">Área</label>
          <div class="relative mt-1">
            <select
              v-model="form.area"
              class="h-11 w-full appearance-none rounded-xl bg-black/5 px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-black/10"
              required
            >
              <option value="" disabled>Selecciona un área</option>
              <option value="BO">BO · Back Office</option>
              <option value="PA">PA · Panadería</option>
              <option value="PE">PE · Piso de Entrega</option>
              <option value="CK">CK · Cocina</option>
              <option value="3L">3L · Tres Leches</option>
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
        <div>
          <label class="text-xs font-semibold text-black/60">
            Especialidad
            <span class="font-normal text-black/40">(opcional)</span>
          </label>
          <input
            v-model="form.specialty"
            class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Ej. Especialista en pasteles de tres leches"
          />
        </div>
      </template>

      <!-- === ASSISTANT: branchId === -->
      <template v-else-if="form.role === 'ASSISTANT'">
        <div>
          <label class="text-xs font-semibold text-black/60">Sucursal</label>
          <div class="relative mt-1">
            <select
              v-model="form.branchId"
              class="h-11 w-full appearance-none rounded-xl bg-black/5 px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-black/10"
              required
            >
              <option value="" disabled>Selecciona una sucursal</option>
              <option v-for="b in branches" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
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
      </template>

      <!-- Toggle isActive (solo en edición) -->
      <div
        v-if="mode === 'edit'"
        class="flex items-center justify-between rounded-xl bg-black/5 px-4 py-3"
      >
        <span class="text-sm font-semibold text-black/70">Usuario activo</span>
        <button
          type="button"
          @click="form.isActive = !form.isActive"
          class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none"
          :style="{ backgroundColor: form.isActive ? '#FFBEE6' : '#D1D5DB' }"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
            :class="form.isActive ? 'translate-x-6' : 'translate-x-1'"
          />
        </button>
      </div>

      <div
        v-if="errorMsg"
        class="rounded-xl bg-red-50 p-3 text-sm text-red-700 border border-red-200"
      >
        {{ errorMsg }}
      </div>

      <div class="mt-2 flex justify-end gap-2">
        <button
          type="button"
          class="h-10 rounded-xl bg-black/10 px-4 text-sm font-semibold text-black/80 hover:bg-black/15"
          @click="emit('close')"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="h-10 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          :disabled="saving"
        >
          {{
            saving ? "Guardando..." : mode === "create" ? "Agregar" : "Guardar"
          }}
        </button>
      </div>
    </form>
  </UiBaseModal>
</template>

<script setup lang="ts">
import { usersService } from "~/services/users.service";
import { branchesService } from "~/services/branches.service";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserItem,
} from "~/types/user.types";
import type { BranchResponse } from "~/types/branch.types";

const props = defineProps<{
  mode: "create" | "edit";
  user?: UserItem | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created", user: UserItem): void;
  (e: "saved"): void;
}>();

const saving = ref(false);
const errorMsg = ref("");
const showPassword = ref(false);

const branches = ref<BranchResponse[]>([]);

const form = reactive({
  name: props.user?.name ?? "",
  lastname: props.user?.lastname ?? "",
  username: props.user?.username ?? "",
  userkey: "",
  role: props.user?.role ?? "",
  branchId: props.user?.branch?.id ?? "",
  branchIds: props.user?.branches?.map((b) => b.id) ?? ([] as string[]),
  area: props.user?.area ?? "",
  specialty: props.user?.specialty ?? "",
  isActive: props.user?.isActive ?? true,
});

const roleSubtitles: Record<string, string> = {
  SUPER: "Acceso total al sistema",
  ADMIN: "Administración general",
  EMPLOYEE: "Asignado a una sucursal y área",
  BAKER: "Puede pertenecer a varias sucursales",
  ASSISTANT: "Asignado a una sucursal",
};

const roleSubtitle = computed(() => roleSubtitles[form.role] ?? "");

// Reset campos extras al cambiar de rol
watch(
  () => form.role,
  () => {
    form.branchId = "";
    form.branchIds = [];
    form.area = "";
    form.specialty = "";
  },
);

onMounted(async () => {
  try {
    branches.value = await branchesService.getBranches();
  } catch {
    /* si falla, los selects quedarán vacíos */
  }
});

async function onSubmit() {
  errorMsg.value = "";
  saving.value = true;
  try {
    const payload: CreateUserPayload = {
      name: form.name.trim(),
      lastname: form.lastname.trim(),
      username: form.username.trim(),
      userkey: form.userkey,
      role: form.role,
    };

    if (form.role === "EMPLOYEE" || form.role === "ASSISTANT") {
      payload.branchId = form.branchId || null;
    }
    if (form.role === "BAKER") {
      payload.branchIds = form.branchIds;
      payload.area = form.area || null;
      if (form.specialty.trim()) payload.specialty = form.specialty.trim();
    }

    if (props.mode === "create") {
      const created = await usersService.createUser(payload);
      emit("created", created);
    } else {
      const editPayload: UpdateUserPayload = {
        id: props.user!.id,
        name: form.name.trim(),
        lastname: form.lastname.trim(),
        username: form.username.trim(),
        role: form.role,
        isActive: form.isActive,
      };
      if (form.role === "EMPLOYEE" || form.role === "ASSISTANT") {
        if (form.branchId) editPayload.branchId = form.branchId;
      }
      if (form.role === "BAKER") {
        if (form.branchIds.length > 0) editPayload.branchIds = form.branchIds;
        if (form.area) editPayload.area = form.area;
        if (form.specialty.trim())
          editPayload.specialty = form.specialty.trim();
      }
      await usersService.updateUser(editPayload);
      if (form.userkey) {
        await usersService.resetPassword({
          username: form.username.trim(),
          newPassword: form.userkey,
        });
      }
      emit("saved");
    }

    emit("close");
  } catch (e: any) {
    errorMsg.value = e?.message || "No se pudo guardar el usuario.";
  } finally {
    saving.value = false;
  }
}
</script>
