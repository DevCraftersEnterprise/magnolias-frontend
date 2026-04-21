<script setup lang="ts">
import { branchesService } from "~/services/branches.service";
import type { BranchResponse } from "~/types/branch.types";
import { useToast } from "vue-toastification";

const props = defineProps<{
  branch: BranchResponse;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved", branch: BranchResponse): void;
}>();

const saving = ref(false);
const toast = useToast();

// Keep only last 10 digits — handles values stored with +52 prefix
const toDigits = (v: string | null | undefined) =>
  (v ?? "").replace(/\D/g, "").slice(-10);

const originalPhones = {
  phone1: toDigits(props.branch.phones?.phone1),
  phone2: toDigits(props.branch.phones?.phone2),
  whatsapp: toDigits(props.branch.phones?.whatsapp),
};

const form = reactive({
  name: props.branch.name,
  address: props.branch.address,
  isActive: props.branch.isActive,
  phone1: originalPhones.phone1,
  phone2: originalPhones.phone2,
  whatsapp: originalPhones.whatsapp,
});

async function onSubmit() {
  saving.value = true;
  try {
    const newPhone1 = toDigits(form.phone1);
    const newPhone2 = toDigits(form.phone2) || null;
    const newWhatsapp = toDigits(form.whatsapp) || null;

    const phonesChanged =
      newPhone1 !== originalPhones.phone1 ||
      (newPhone2 ?? "") !== (originalPhones.phone2 ?? "") ||
      (newWhatsapp ?? "") !== (originalPhones.whatsapp ?? "");

    const branchPayload = {
      id: props.branch.id,
      name: form.name.trim(),
      address: form.address.trim(),
      isActive: form.isActive,
    };

    // Always use PATCH regardless of isActive — the PATCH endpoint handles deactivation via isActive: false
    const branchPromise = branchesService.updateBranch(branchPayload);

    let fullBranch: BranchResponse;

    if (phonesChanged) {
      const phonesId = props.branch.phones?.id;

      const phonesPromise = phonesId
        ? branchesService.updateBranchPhones({
            id: phonesId,
            phone1: newPhone1,
            phone2: newPhone2,
            whatsapp: newWhatsapp,
          })
        : branchesService.addBranchPhones(props.branch.id, {
            phone1: newPhone1,
            phone2: newPhone2,
            whatsapp: newWhatsapp,
          });

      const [updatedBranch, updatedPhones] = await Promise.all([
        branchPromise,
        phonesPromise,
      ]);
      fullBranch = {
        ...updatedBranch,
        phones: {
          id: updatedPhones.id,
          phone1: updatedPhones.phone1,
          phone2: updatedPhones.phone2,
          whatsapp: updatedPhones.whatsapp,
        },
      };
    } else {
      const updatedBranch = await branchPromise;
      fullBranch = { ...updatedBranch, phones: props.branch.phones };
    }

    saving.value = false;
    toast.success("Sucursal actualizada correctamente.");
    emit("close");
    emit("saved", fullBranch);
  } catch (e: any) {
    toast.error(e?.message || "No se pudo actualizar la sucursal.");
    saving.value = false;
  }
}
</script>

<template>
  <UiBaseModal :model-value="true" @update:model-value="emit('close')">
    <template #title>Editar sucursal</template>
    <form @submit.prevent="onSubmit" class="space-y-4">
      <!-- Toggle isActive -->
      <div
        class="flex items-center justify-between rounded-xl bg-black/5 px-4 py-3"
      >
        <span class="text-sm font-semibold text-black/70">Sucursal activa</span>
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

      <div>
        <label class="text-xs font-semibold text-black/60"
          >Nombre de la sucursal</label
        >
        <input
          v-model="form.name"
          class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="Ej. Sucursal Centro"
          required
        />
      </div>

      <div>
        <label class="text-xs font-semibold text-black/60">Dirección</label>
        <input
          v-model="form.address"
          class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="Ej. Av. Juárez 123, Col. Centro"
          required
        />
      </div>

      <div>
        <label class="text-xs font-semibold text-black/60"
          >Teléfono principal</label
        >
        <input
          v-model="form.phone1"
          class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="Ej. 55 1234 5678"
          required
        />
      </div>

      <div>
        <label class="text-xs font-semibold text-black/60"
          >Teléfono secundario
          <span class="font-normal text-black/40">(opcional)</span></label
        >
        <input
          v-model="form.phone2"
          class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="Ej. 55 9876 5432"
        />
      </div>

      <div>
        <label class="text-xs font-semibold text-black/60"
          >WhatsApp
          <span class="font-normal text-black/40">(opcional)</span></label
        >
        <input
          v-model="form.whatsapp"
          class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="Ej. 55 1234 5678"
        />
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
          {{ saving ? "Guardando..." : "Guardar" }}
        </button>
      </div>
    </form>
  </UiBaseModal>
</template>
