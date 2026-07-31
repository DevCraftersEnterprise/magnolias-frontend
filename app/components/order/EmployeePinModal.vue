<script setup lang="ts">
const open = defineModel<boolean>({ required: true });

const props = defineProps<{
  loading: boolean;
  error?: string | null;
  actionLabel?: string;
}>();

const emit = defineEmits<{
  (e: "submit", pin: string): void;
}>();

const pin = ref("");

watch(open, (v) => {
  if (v) pin.value = "";
});

function onSubmit() {
  if (!pin.value.trim()) return;
  emit("submit", pin.value.trim());
}
</script>

<template>
  <UiBaseModal v-model="open">
    <template #title> Identifícate </template>
    <template #subtitle>
      Ingresa tu PIN para {{ props.actionLabel || "continuar" }}.
    </template>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="text-[13px] text-gray-700">PIN:</label>
        <input
          v-model="pin"
          type="password"
          inputmode="numeric"
          maxlength="6"
          class="mt-1.5 w-full rounded-xl bg-gray-100 border border-transparent px-4 py-2.5 text-center text-[20px] tracking-[0.3em] outline-none focus:border-gray-300"
          placeholder="••••"
          autocomplete="off"
        />
      </div>

      <p v-if="props.error" class="text-[13px] text-red-600">
        {{ props.error }}
      </p>
    </form>

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
          class="h-10 rounded-lg px-4 text-[13px] font-semibold bg-[#1F1F1F] text-white hover:bg-black transition disabled:opacity-60"
          :disabled="props.loading"
          @click="onSubmit"
        >
          {{ props.loading ? "Verificando..." : "Confirmar" }}
        </button>
      </div>
    </template>
  </UiBaseModal>
</template>
