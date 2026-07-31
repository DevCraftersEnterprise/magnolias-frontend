<script setup lang="ts">
import { Icon } from "@iconify/vue";

const open = defineModel<boolean>({ required: true });

const props = defineProps<{
  loading: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: "submit", payload: { username: string; userkey: string }): void;
}>();

const username = ref("");
const userkey = ref("");
const show = ref(false);

watch(open, (v) => {
  if (v) {
    username.value = "";
    userkey.value = "";
    show.value = false;
  }
});

function onSubmit() {
  if (!username.value.trim() || !userkey.value.trim()) return;
  emit("submit", { username: username.value.trim(), userkey: userkey.value });
}
</script>

<template>
  <UiBaseModal v-model="open">
    <template #title> Autorizar descuento </template>
    <template #subtitle>
      Se requiere usuario y contraseña de un Admin o Super para aplicar el
      descuento.
    </template>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="text-[13px] text-gray-700">Usuario:</label>
        <input
          v-model="username"
          class="mt-1.5 w-full rounded-xl bg-gray-100 border border-transparent px-4 py-2.5 text-[14px] outline-none focus:border-gray-300"
          placeholder="Nombre de usuario del admin/super"
          autocomplete="off"
        />
      </div>

      <div>
        <label class="text-[13px] text-gray-700">Contraseña:</label>
        <div class="relative mt-1.5">
          <input
            v-model="userkey"
            :type="show ? 'text' : 'password'"
            class="w-full rounded-xl bg-gray-100 border border-transparent px-4 py-2.5 pr-11 text-[14px] outline-none focus:border-gray-300"
            placeholder="************"
            autocomplete="off"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            @click="show = !show"
            aria-label="Mostrar/ocultar"
          >
            <Icon v-if="!show" icon="lucide:eye" width="18" height="18" />
            <Icon v-else icon="lucide:eye-off" width="18" height="18" />
          </button>
        </div>
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
          {{ props.loading ? "Verificando..." : "Autorizar" }}
        </button>
      </div>
    </template>
  </UiBaseModal>
</template>
