<template>
  <!-- ===== HERO ===== -->
  <section
    class="relative overflow-hidden pt-28 pb-16 px-5 text-center"
    style="
      background: radial-gradient(
        ellipse at 65% 0%,
        #fce8f0 0%,
        #f9d5e6 45%,
        #f2b3d0 100%
      );
    "
  >
    <img
      src="/svg/flower-tl.svg"
      alt=""
      class="pointer-events-none absolute top-0 left-0 w-48 opacity-20"
    />
    <img
      src="/svg/flower-tl.svg"
      alt=""
      class="pointer-events-none absolute top-0 right-0 w-48 opacity-20 scale-x-[-1]"
    />
    <h1 class="relative font-serif text-4xl sm:text-5xl text-[#1E1E1E]">
      Nuestras Sucursales
    </h1>
    <p
      class="relative mt-3 text-sm sm:text-base text-[#1E1E1E]/60 max-w-md mx-auto"
    >
      Visítanos en cualquiera de nuestras ubicaciones. ¡Siempre cerca de ti!
    </p>
  </section>

  <!-- ===== CARDS ===== -->
  <section class="py-12 px-5 bg-white">
    <div class="mx-auto max-w-6xl">
      <!-- Loading -->
      <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-white rounded-2xl shadow p-5 animate-pulse space-y-3"
        >
          <div class="h-36 rounded-xl bg-black/10"></div>
          <div class="h-5 w-1/2 rounded bg-black/10"></div>
          <div class="h-3 w-full rounded bg-black/10"></div>
          <div class="h-3 w-3/4 rounded bg-black/10"></div>
          <div class="h-3 w-2/3 rounded bg-black/10"></div>
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="errorMsg"
        class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
      >
        {{ errorMsg }}
      </div>

      <!-- Cards -->
      <div
        v-else-if="branches.length"
        class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="branch in branches"
          :key="branch.id"
          class="bg-white rounded-2xl shadow p-5 min-w-0"
          :class="!branch.isActive ? 'opacity-60' : ''"
        >
          <!-- Nombre + badge inactivo -->
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-lg text-[#1E1E1E] leading-snug">{{
              branch.name
            }}</span>
          </div>
          <div class="mb-3">
            <span
              v-if="!branch.isActive"
              class="inline-flex items-center gap-1 rounded-full bg-black/8 px-2.5 py-0.5 text-[10px] font-semibold text-black/50"
            >
              <span class="h-1.5 w-1.5 rounded-full bg-black/30"></span>
              No disponible
            </span>
          </div>

          <hr class="border-gray-100 mb-3" />

          <!-- Dirección -->
          <div class="flex items-start gap-2 text-[#6B7280] mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#f472b6"
              class="w-5 h-5 flex-shrink-0 mt-0.5"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              />
            </svg>
            <span class="text-sm leading-snug">{{ branch.address }}</span>
          </div>

          <!-- Teléfono 1 -->
          <div
            v-if="branch.phones?.phone1"
            class="flex items-center gap-2 text-[#6B7280] mb-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#f472b6"
              class="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
            >
              <path
                d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
              />
            </svg>
            <span class="text-sm">{{ formatPhone(branch.phones.phone1) }}</span>
          </div>

          <!-- Teléfono 2 -->
          <div
            v-if="branch.phones?.phone2"
            class="flex items-center gap-2 text-[#6B7280] mb-1.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#f472b6"
              class="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
            >
              <path
                d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
              />
            </svg>
            <span class="text-sm">{{ formatPhone(branch.phones.phone2) }}</span>
          </div>

          <!-- WhatsApp -->
          <div
            v-if="branch.phones?.whatsapp"
            class="flex items-center gap-2 text-[#6B7280] mb-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#f472b6"
              class="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
            <span class="text-sm">{{
              formatPhone(branch.phones.whatsapp)
            }}</span>
          </div>

          <!-- Mapa -->
          <AdminBranchMap
            v-if="branch.latitude && branch.longitude"
            :latitude="Number(branch.latitude)"
            :longitude="Number(branch.longitude)"
            :name="branch.name"
            class="mt-1"
          />
          <div
            v-else
            class="mt-1 h-36 rounded-xl bg-gradient-to-br from-[#F7C0DB] to-[#F48AC1] flex items-center justify-center"
          >
            <svg
              class="h-8 w-8 text-white/60"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Sin sucursales -->
      <div
        v-else
        class="rounded-2xl bg-[#FFF0F7] border border-[#F472B6]/20 p-16 text-center"
      >
        <div class="text-5xl mb-4">📍</div>
        <p class="text-[#1E1E1E]/40 text-sm">
          No hay sucursales disponibles por el momento.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BranchResponse } from "~/types/branch.types";

definePageMeta({ layout: "landing" });
useHead({ title: "Sucursales · Magnolias" });

const apiBase = (useRuntimeConfig().public.apiBase as string).replace(
  /\/$/,
  "",
);

const loading = ref(true);
const errorMsg = ref("");
const branches = ref<BranchResponse[]>([]);

onMounted(async () => {
  try {
    const data = await $fetch<BranchResponse[]>(`${apiBase}/api/branches`);
    branches.value = Array.isArray(data) ? data : [];
  } catch {
    errorMsg.value = "No se pudieron cargar las sucursales.";
  } finally {
    loading.value = false;
  }
});
</script>
