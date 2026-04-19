<template>
  <UiBaseModal v-model="open">
    <template #title>
      {{
        title || (mode === "create" ? "Agregar elemento" : "Editar elemento")
      }}
    </template>

    <div class="space-y-3">
      <div>
        <label class="block text-[12px] font-semibold text-gray-600 mb-1"
          >Nombre</label
        >
        <input
          v-model.trim="local.name"
          type="text"
          class="w-full h-11 rounded-xl bg-gray-100 px-4 text-[14px] outline-none ring-2 ring-transparent focus:ring-black/10"
          placeholder="Nombre"
        />
      </div>

      <div>
        <label class="block text-[12px] font-semibold text-gray-600 mb-1"
          >Descripción</label
        >
        <textarea
          v-model.trim="local.description"
          rows="4"
          class="w-full rounded-xl bg-gray-100 px-4 py-3 text-[14px] outline-none ring-2 ring-transparent focus:ring-black/10 resize-none"
          placeholder="Descripción"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          type="button"
          class="h-10 rounded-lg px-4 text-[13px] font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          @click="open = false"
        >
          Cancelar
        </button>

        <button
          type="button"
          class="h-10 rounded-lg px-4 text-[13px] font-semibold bg-[#1F1F1F] text-white hover:bg-black transition disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="!local.name"
          @click="submit"
        >
          Guardar
        </button>
      </div>
    </template>
  </UiBaseModal>
</template>

<script setup lang="ts">
export type CatalogEditPayload = {
  id?: string;
  name: string;
  description?: string;
};

const open = defineModel<boolean>({ required: true });

const props = defineProps<{
  mode: "create" | "edit";
  model: CatalogEditPayload | null;
  title?: string; // ✅ NUEVO
}>();

const emit = defineEmits<{
  (e: "save", payload: CatalogEditPayload): void;
}>();

const local = reactive<CatalogEditPayload>({
  id: undefined,
  name: "",
  description: "",
});

watch(
  () => props.model,
  (m) => {
    local.id = m?.id;
    local.name = m?.name ?? "";
    local.description = m?.description ?? "";
  },
  { immediate: true },
);

function submit() {
  emit("save", {
    id: local.id,
    name: local.name,
    description: local.description,
  });
}
</script>
