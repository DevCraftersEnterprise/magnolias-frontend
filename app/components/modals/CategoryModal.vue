<template>
  <BaseModal
    :title="mode === 'create' ? 'Agregar categoría' : 'Editar categoría'"
    :subtitle="mode === 'create' ? '' : ''"
    @close="emit('close')"
  >
    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label class="text-xs font-semibold text-black/60">Nombre</label>
        <input
          v-model="form.name"
          class="mt-1 h-11 w-full rounded-xl bg-black/5 px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="Nombre"
          required
        />
      </div>

      <div>
        <label class="text-xs font-semibold text-black/60">Descripción</label>
        <textarea
          v-model="form.description"
          rows="4"
          class="mt-1 w-full rounded-xl bg-black/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          placeholder="Descripción"
          required
        />
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
          {{ saving ? "Guardando..." : "Guardar" }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import { categoriesService } from "~/services/categories.service";
import type { CategoryItem } from "~/types/product.types";
import BaseModal from "~/components/modals/BaseModal.vue";

const props = defineProps<{
  open: boolean;
  mode: "create" | "edit";
  category?: CategoryItem | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const saving = ref(false);
const errorMsg = ref("");

const form = reactive({
  name: "",
  description: "",
});

watch(
  () => props.open,
  (v) => {
    if (!v) return;
    errorMsg.value = "";
    form.name = props.mode === "edit" ? (props.category?.name ?? "") : "";
    form.description =
      props.mode === "edit" ? (props.category?.description ?? "") : "";
  },
  { immediate: true },
);

async function onSubmit() {
  errorMsg.value = "";
  saving.value = true;
  try {
    if (props.mode === "create") {
      await categoriesService.create({
        name: form.name.trim(),
        description: form.description.trim(),
      });
    } else {
      if (!props.category?.id) throw new Error("ID requerido.");
      await categoriesService.patch(props.category.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        isActive: true,
      });
    }
    emit("saved");
    emit("close");
  } catch (e: any) {
    errorMsg.value = e?.message || "No se pudo guardar.";
  } finally {
    saving.value = false;
  }
}
</script>
