<script setup lang="ts">
import { branchesService } from "~/services/branches.service";
import type { BranchResponse } from "~/types/branch.types";
import { useToast } from "vue-toastification";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "created", branch: BranchResponse): void;
}>();

const step = ref<1 | 2>(1);
const saving = ref(false);
const toast = useToast();
const createdBranchId = ref("");
const createdBranch = ref<BranchResponse | null>(null);

const form = reactive({
  name: "",
  address: "",
  phone1: "",
  phone2: "",
  whatsapp: "",
});

function onClose() {
  step.value = 1;
  form.name = "";
  form.address = "";
  form.phone1 = "";
  form.phone2 = "";
  form.whatsapp = "";
  createdBranchId.value = "";
  createdBranch.value = null;
  emit("close");
}

async function onStep1() {
  saving.value = true;
  try {
    const branch = await branchesService.createBranch({
      name: form.name.trim(),
      address: form.address.trim(),
    });
    createdBranchId.value = branch.id;
    createdBranch.value = branch;
    step.value = 2;
  } catch (e: any) {
    toast.error(e?.message || "No se pudo crear la sucursal.");
  } finally {
    saving.value = false;
  }
}

async function onStep2() {
  saving.value = true;
  try {
    const phones = await branchesService.addBranchPhones(
      createdBranchId.value,
      {
        phone1: form.phone1.replace(/\s/g, ""),
        phone2: form.phone2.replace(/\s/g, "") || null,
        whatsapp: form.whatsapp.replace(/\s/g, "") || null,
      },
    );
    const fullBranch: BranchResponse = {
      ...createdBranch.value!,
      phones: {
        id: phones.id,
        phone1: phones.phone1,
        phone2: phones.phone2,
        whatsapp: phones.whatsapp,
      },
    };
    saving.value = false;
    toast.success("Sucursal creada correctamente.");
    emit("close");
    emit("created", fullBranch);
  } catch (e: any) {
    toast.error(e?.message || "No se pudieron guardar los teléfonos.");
    saving.value = false;
  }
}
</script>

<template>
  <UiBaseModal :model-value="true" @update:model-value="onClose">
    <template #title>{{
      step === 1 ? "Agregar sucursal" : "Agregar teléfonos"
    }}</template>
    <template v-if="step === 1" #subtitle
      >Paso 1 de 2 · Información general</template
    >
    <template v-else #subtitle>Paso 2 de 2 · Contacto</template>
    <!-- Paso 1: nombre y dirección -->
    <form v-if="step === 1" @submit.prevent="onStep1" class="space-y-4">
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

      <div class="mt-2 flex justify-end gap-2">
        <button
          type="button"
          class="h-10 rounded-xl bg-black/10 px-4 text-sm font-semibold text-black/80 hover:bg-black/15"
          @click="onClose"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="h-10 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          :disabled="saving"
        >
          {{ saving ? "Guardando..." : "Siguiente" }}
        </button>
      </div>
    </form>

    <!-- Paso 2: teléfonos -->
    <form v-else @submit.prevent="onStep2" class="space-y-4">
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
          :disabled="saving"
          @click="step = 1"
        >
          Atrás
        </button>
        <button
          type="submit"
          class="h-10 rounded-xl bg-[#111827] px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
          :disabled="saving"
        >
          {{ saving ? "Guardando..." : "Finalizar" }}
        </button>
      </div>
    </form>
  </UiBaseModal>
</template>
