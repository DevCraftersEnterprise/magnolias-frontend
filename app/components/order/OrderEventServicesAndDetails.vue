<script setup lang="ts">
defineProps<{
  step2: {
    deliveryDate: string;
    eventServices: {
      dessertTable: boolean;
      cake: boolean;
      cheeseTable: boolean;
      plated: boolean;
    };
    eventGuestCount: number | "";
    eventResponsibleName: string;
  };
}>();
</script>

<template>
  <fieldset>
    <div class="flex items-center gap-3 mb-3">
      <legend
        class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide"
      >
        Servicios
      </legend>
      <span v-if="step2.deliveryDate" class="text-[12px] text-gray-400">{{
        step2.deliveryDate
      }}</span>
    </div>
    <div
      class="flex flex-wrap items-center gap-4 rounded-xl border border-black/10 bg-white px-5 py-4"
    >
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input
          v-model="step2.eventServices.dessertTable"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
        />
        <span class="text-[13px] text-gray-700">Mesa de Postres</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input
          v-model="step2.eventServices.cake"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
        />
        <span class="text-[13px] text-gray-700">Pastel</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input
          v-model="step2.eventServices.cheeseTable"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
        />
        <span class="text-[13px] text-gray-700">Mesa de Quesos</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer select-none">
        <input
          v-model="step2.eventServices.plated"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
        />
        <span class="text-[13px] text-gray-700">Platillos</span>
      </label>
    </div>
  </fieldset>

  <fieldset>
    <legend
      class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3"
    >
      Detalles del Evento
    </legend>
    <div class="rounded-xl border border-black/10 bg-white px-5 py-4">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Número de invitados -->
        <div class="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <label class="text-[13px] font-medium text-gray-700 flex-shrink-0"
            >Número de invitados</label
          >
          <input
            v-model.number="step2.eventGuestCount"
            type="number"
            min="1"
            placeholder="150"
            class="w-24 rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
          />
        </div>
        <!-- Responsable del montaje -->
        <div class="flex items-center gap-2 flex-1 min-w-[220px]">
          <label class="text-[13px] font-medium text-gray-700 flex-shrink-0"
            >Responsable del montaje</label
          >
          <input
            v-model="step2.eventResponsibleName"
            type="text"
            placeholder="Nombre del responsable"
            class="flex-1 min-w-0 rounded-xl bg-white px-3 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60"
          />
        </div>
      </div>
    </div>
  </fieldset>
</template>
