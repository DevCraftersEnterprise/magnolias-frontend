<script setup lang="ts">
import { branchesService } from "~/services/branches.service";
import type { BranchResponse } from "~/types/branch.types";

definePageMeta({ layout: "admin", pageTitle: "Sucursales" });
useHead({ title: "Sucursales · Magnolias" });

// ─── State ───────────────────────────────────────────────────────────────────
const loading = ref(true);
const errorMsg = ref("");
const showModal = ref(false);
const editingBranch = ref<BranchResponse | null>(null);
const branches = ref<BranchResponse[]>([]);

// ─── Load ────────────────────────────────────────────────────────────────────
async function loadBranches() {
  try {
    const data = await branchesService.getBranches();
    branches.value = data;
  } catch (error) {
    errorMsg.value = "Error al cargar las sucursales.";
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function onBranchCreated(branch: BranchResponse) {
  branches.value.push(branch);
}

function onBranchUpdated(branch: BranchResponse) {
  const idx = branches.value.findIndex((b) => b.id === branch.id);
  if (idx !== -1) branches.value[idx] = branch;
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(() => loadBranches());
</script>

<template>
  <div class="px-6 py-6">
    <div class="top-0 z-20 -mx-6 px-6 pt-2 pb-4">
      <div class="flex items-center justify-end gap-3">
        <button
          @click="showModal = true"
          class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#101541] shadow-sm ring-1 ring-black/5 hover:shadow transition active:scale-[0.99]"
        >
          <span class="grid h-6 w-6 place-content-center rounded-lg bg-black/5">
            <svg fill="none" class="h-4 w-4 text-[#101541]" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
                d="M12 5v14m-7-7h14"
              />
            </svg>
          </span>
          Agregar sucursal
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-wrap gap-6">
      <div
        v-for="n in 2"
        :key="n"
        class="bg-white rounded-2xl shadow p-5 min-w-[240px] max-w-xs w-full animate-pulse"
        style="height: 180px"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="h-6 w-32 rounded bg-black/10"></div>
          <div class="h-5 w-5 rounded bg-black/10"></div>
        </div>
        <div class="border-b border-gray-200 my-2"></div>
        <div class="flex items-center gap-2 mb-2">
          <div class="h-5 w-5 rounded-full bg-black/10"></div>
          <div class="h-4 w-28 rounded bg-black/10"></div>
        </div>
        <div class="flex items-center gap-2 mb-1">
          <div class="h-5 w-5 rounded-full bg-black/10"></div>
          <div class="h-4 w-24 rounded bg-black/10"></div>
        </div>
        <div class="flex items-center gap-2 mb-1">
          <div class="h-5 w-5 rounded-full bg-black/10"></div>
          <div class="h-4 w-24 rounded bg-black/10"></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="h-6 w-6 rounded-full bg-black/10"></div>
          <div class="h-4 w-24 rounded bg-black/10"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="errorMsg"
      class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ errorMsg }}
    </div>

    <div
      v-if="branches.length > 0"
      class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <BranchCard
        v-for="sucursal in branches"
        :key="sucursal.id"
        :name="sucursal.name"
        :address="sucursal.address"
        :phone1="sucursal.phones.phone1"
        :phone2="sucursal.phones.phone2 ?? undefined"
        :whatsapp="sucursal.phones.whatsapp ?? undefined"
        :isActive="sucursal.isActive"
        :latitude="sucursal.latitude"
        :longitude="sucursal.longitude"
        @edit="editingBranch = sucursal"
      />
    </div>

    <div
      v-else-if="!loading && !errorMsg"
      class="mt-12 flex flex-col items-center justify-center gap-3 text-center"
    >
      <div
        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/5"
      >
        <svg
          class="h-7 w-7 text-[#9CA3AF]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
          />
        </svg>
      </div>
      <p class="text-[15px] font-semibold text-[#111827]">
        Sin sucursales registradas
      </p>
      <p class="text-[13px] text-[#6B7280]">
        Agrega la primera sucursal usando el botón de arriba.
      </p>
    </div>
  </div>

  <BranchCreateModal
    v-if="showModal"
    @close="showModal = false"
    @created="onBranchCreated"
  />

  <BranchEditModal
    v-if="editingBranch"
    :branch="editingBranch"
    @close="editingBranch = null"
    @saved="onBranchUpdated"
  />
</template>
