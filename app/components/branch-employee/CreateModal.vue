<script setup lang="ts">
import { branchEmployeesService } from "~/services/branch-employees.service";
import type {
  BranchEmployeeItem,
  CreateBranchEmployeePayload,
  UpdateBranchEmployeePayload,
} from "~/types/branch-employee.types";
import { useToast } from "vue-toastification";

const props = defineProps<{
  mode: "create" | "edit";
  branchId: string;
  employee?: BranchEmployeeItem | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created", employee: BranchEmployeeItem): void;
  (e: "saved"): void;
}>();

const toast = useToast();
const saving = ref(false);

const form = reactive({
  name: props.employee?.name ?? "",
  lastname: props.employee?.lastname ?? "",
  pin: "",
  isActive: props.employee?.isActive ?? true,
});

async function onSubmit() {
  saving.value = true;
  try {
    if (props.mode === "create") {
      const payload: CreateBranchEmployeePayload = {
        name: form.name.trim(),
        lastname: form.lastname.trim(),
        pin: form.pin,
        branchId: props.branchId,
      };
      const created = await branchEmployeesService.createBranchEmployee(payload);
      emit("created", created);
    } else {
      const payload: UpdateBranchEmployeePayload = {
        name: form.name.trim(),
        lastname: form.lastname.trim(),
        isActive: form.isActive,
      };
      if (form.pin) payload.pin = form.pin;
      await branchEmployeesService.updateBranchEmployee(props.employee!.id, payload);
      emit("saved");
    }

    toast.success("Empleado guardado correctamente.");
    emit("close");
  } catch (e: any) {
    toast.error(e?.message || "No se pudo guardar el empleado.");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UiBaseModal :model-value="true" @update:model-value="emit('close')">
    <template #title>{{
      mode === "create" ? "Agregar empleado" : "Editar empleado"
    }}</template>
    <template #subtitle
      >El PIN se usa para identificar al empleado al crear, editar, entregar o
      cancelar pedidos.</template
    >
    <form @submit.prevent="onSubmit" class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-semibold text-black/60">Nombre</label>
          <input
            v-model="form.name"
            class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="María"
            required
          />
        </div>
        <div>
          <label class="text-xs font-semibold text-black/60">Apellido</label>
          <input
            v-model="form.lastname"
            class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="García"
            required
          />
        </div>
      </div>

      <div>
        <label class="text-xs font-semibold text-black/60">
          {{ mode === "create" ? "PIN" : "Nuevo PIN" }}
          <span v-if="mode === 'edit'" class="font-normal text-black/40"
            >(opcional, 4 a 6 dígitos)</span
          >
        </label>
        <input
          v-model="form.pin"
          type="text"
          inputmode="numeric"
          maxlength="6"
          class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="4821"
          :required="mode === 'create'"
        />
      </div>

      <div
        v-if="mode === 'edit'"
        class="flex items-center justify-between rounded-xl bg-black/5 px-4 py-3"
      >
        <span class="text-sm font-semibold text-black/70">Empleado activo</span>
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
