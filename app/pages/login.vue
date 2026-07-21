<script setup lang="ts">
definePageMeta({ layout: "auth", middleware: ["guest"] });
useHead({ title: "Iniciar sesión · Magnolias" });
import { Icon } from "@iconify/vue";
import { useToast } from "vue-toastification";

const { login, loading } = useAuth();
const toast = useToast();

const username = ref("");
const userkey = ref("");
const show = ref(false);

const onSubmit = async () => {
  try {
    await login(username.value.trim(), userkey.value);
  } catch (e: any) {
    toast.error(e?.message || "No se pudo iniciar sesión");
  }
};
</script>

<template>
  <div>
    <div class="flex flex-col items-center">
      <img src="/img/magnolias-logo.png" alt="Magnolias" class="h-16 mb-4" />

      <h1 class="text-3xl font-semibold tracking-wide text-[#2a2a2a]">
        Bienvenido/a
      </h1>
    </div>

    <form class="mt-10 space-y-5" @submit.prevent="onSubmit">
      <div>
        <label class="text-sm text-gray-700">Usuario:</label>
        <input
          v-model="username"
          class="mt-2 w-full rounded-xl bg-gray-100 border border-transparent px-4 py-3 outline-none focus:border-gray-300"
          placeholder="Nombre de usuario..."
          autocomplete="username"
        />
      </div>

      <div>
        <label class="text-sm text-gray-700">Contraseña:</label>
        <div class="relative mt-2">
          <input
            v-model="userkey"
            :type="show ? 'text' : 'password'"
            class="w-full rounded-xl bg-gray-100 border border-transparent px-4 py-3 pr-12 outline-none focus:border-gray-300"
            placeholder="************"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            @click="show = !show"
            aria-label="Mostrar/ocultar"
          >
            <Icon v-if="!show" icon="lucide:eye" width="20" height="20" />
            <Icon v-else icon="lucide:eye-off" width="20" height="20" />
          </button>
        </div>
      </div>

      <button
        class="w-full mt-2 rounded-xl bg-[#1f1f1f] text-white font-semibold py-3 shadow-sm hover:opacity-95 disabled:opacity-60"
        :disabled="loading"
      >
        {{ loading ? "Entrando..." : "Iniciar sesión" }}
      </button>
    </form>
  </div>
</template>
