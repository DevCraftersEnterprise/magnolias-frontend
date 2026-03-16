<script setup lang="ts">
definePageMeta({ layout: "admin" });
useHead({ title: "Sucursales · Magnolias" });

import SucursalCard from '~/components/SucursalCard.vue';
import { branchesService, type BranchResponse } from '~/services/branches.service';

const loading = ref(true);
const errorMsg = ref("");

const branches = ref<BranchResponse[]>([]);

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
onMounted(() => loadBranches());
</script>

<template>
    <div class="px-6 py-6">
        <div class="top-0 z-20 -mx-6 px-6 pt-2 pb-4">
            <div class="flex items-center justify-end gap-3">
                <button
                    class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#101541] shadow-sm ring-1 ring-black/5 hover:shadow transition active:scale-[0.99]">
                    <span class="grid h-6 w-6 place-content-center rounded-lg bg-black/5">
                        <svg fill="none" class="h-4 w-4 text-[#101541]" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M12 5v14m-7-7h14" />
                        </svg>
                    </span>
                    Agregar sucursal
                </button>
            </div>
        </div>

        <div v-if="loading" class="flex flex-wrap gap-6">
            <div v-for="n in 2" :key="n"
                class="bg-white rounded-2xl shadow p-5 min-w-[240px] max-w-xs w-full animate-pulse"
                style="height: 180px;">
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

        <div v-else-if="errorMsg" class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {{ errorMsg }}
        </div>

        <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <SucursalCard v-for="sucursal in branches" :key="sucursal.id" :name="sucursal.name"
                :address="sucursal.address" :phone1="sucursal.phones.phone1"
                :phone2="sucursal.phones.phone2 ?? undefined" :whatsapp="sucursal.phones.whatsapp ?? undefined" />
        </div>
    </div>


</template>