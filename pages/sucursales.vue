<template>
  <!-- Hero compacto -->
  <section class="bg-gradient-to-br from-[#FFF0F7] via-[#FDE8F2] to-[#FAD6EA] py-16 px-5 text-center">
    <h1 class="text-3xl sm:text-4xl font-bold text-[#101541]">Nuestras Sucursales</h1>
    <p class="mt-3 text-sm sm:text-base text-[#101541]/60 max-w-lg mx-auto">
      Visítanos en cualquiera de nuestras ubicaciones. ¡Siempre cerca de ti!
    </p>
  </section>

  <!-- Sucursales -->
  <section class="py-14 px-5">
    <div class="mx-auto max-w-6xl">
      <!-- Loading -->
      <div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 3" :key="n" class="rounded-2xl bg-white ring-1 ring-black/5 p-5 animate-pulse space-y-3">
          <div class="h-36 rounded-xl bg-black/10"></div>
          <div class="h-4 w-2/3 rounded bg-black/10"></div>
          <div class="h-3 w-full rounded bg-black/10"></div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="errorMsg" class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {{ errorMsg }}
      </div>

      <!-- Cards -->
      <div v-else-if="branches.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="branch in branches"
          :key="branch.id"
          class="rounded-2xl bg-white ring-1 ring-black/5 shadow-sm overflow-hidden"
        >
          <!-- Mapa -->
          <BranchMap
            v-if="branch.latitude && branch.longitude"
            :latitude="Number(branch.latitude)"
            :longitude="Number(branch.longitude)"
            :name="branch.name"
          />
          <div v-else class="h-36 bg-gradient-to-br from-[#F7C0DB] to-[#F48AC1] flex items-center justify-center">
            <svg class="h-8 w-8 text-white/60" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>

          <!-- Info -->
          <div class="p-4 space-y-1.5">
            <h3 class="font-semibold text-[#101541]">{{ branch.name }}</h3>
            <p v-if="branch.address" class="text-sm text-[#101541]/60 leading-snug">{{ branch.address }}</p>
            <p v-if="branch.phone" class="text-sm text-[#101541]/60">📞 {{ branch.phone }}</p>
            <p v-if="branch.schedule" class="text-sm text-[#101541]/60">🕐 {{ branch.schedule }}</p>
          </div>
        </div>
      </div>

      <!-- Sin sucursales -->
      <div v-else class="rounded-2xl bg-[#FFF0F7] border border-[#F472B6]/20 p-12 text-center">
        <div class="text-5xl mb-4">📍</div>
        <p class="text-[#101541]/50 text-sm">No hay sucursales disponibles por el momento.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BranchMap from '~/components/BranchMap.vue'
import { branchesService, type BranchResponse } from '~/services/branches.service'

definePageMeta({ layout: 'landing' })
useHead({ title: 'Sucursales · Magnolias' })

const loading = ref(true)
const errorMsg = ref('')
const branches = ref<BranchResponse[]>([])

onMounted(async () => {
  try {
    branches.value = await branchesService.getBranches()
  } catch {
    errorMsg.value = 'No se pudieron cargar las sucursales.'
  } finally {
    loading.value = false
  }
})
</script>
