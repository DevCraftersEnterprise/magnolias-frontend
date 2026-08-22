<script setup lang="ts">
import type { BranchResponse } from "~/types/branch.types";

defineProps<{
  step2: { pickupBranchId: string; pickupDate: string };
  branches: BranchResponse[];
  pickupTimeParts: { h: number; m: string; p: "AM" | "PM" };
  minDeliveryDate: string;
  pickupTimeOutOfHours: boolean;
  minuteOptions: readonly string[];
}>();
</script>

<template>
  <fieldset class="space-y-0">
    <legend
      class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3"
    >
      Logística de Recolección
    </legend>
    <div
      class="divide-y divide-black/8 rounded-xl border border-black/10 overflow-hidden"
    >
      <!-- Sucursal -->
      <div class="flex items-center gap-3 px-4 py-3 bg-white">
        <svg
          viewBox="0 0 24 24"
          class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            stroke-linejoin="round"
          />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <label
          for="pickup-branch"
          class="text-[13px] font-medium text-gray-700 w-36 flex-shrink-0"
          >Sucursal</label
        >
        <div class="relative flex-1">
          <select
            id="pickup-branch"
            v-model="step2.pickupBranchId"
            class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
          >
            <option value="" disabled>Selecciona sucursal</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
          <svg
            class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
      <!-- Fecha + Hora -->
      <div
        class="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 bg-white"
      >
        <div class="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <label
            for="pickup-date"
            class="text-[13px] font-medium text-gray-700 flex-shrink-0"
            >Fecha de recolección</label
          >
          <input
            id="pickup-date"
            v-model="step2.pickupDate"
            type="date"
            :min="minDeliveryDate"
            class="rounded-lg border border-black/12 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
          />
        </div>
        <div class="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          <label
            id="pickup-time-label"
            class="text-[13px] font-medium text-gray-700 flex-shrink-0"
            >Hora de recolección</label
          >
          <div class="flex items-center gap-1">
            <select
              v-model.number="pickupTimeParts.h"
              aria-label="Hora"
              aria-labelledby="pickup-time-label"
              class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"
            >
              <option v-for="h in 12" :key="h" :value="h">
                {{ h }}
              </option>
            </select>
            <span class="text-gray-400 text-[13px] font-medium">:</span>
            <select
              v-model="pickupTimeParts.m"
              aria-label="Minutos"
              aria-labelledby="pickup-time-label"
              class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"
            >
              <option v-for="m in minuteOptions" :key="m" :value="m">
                {{ m }}
              </option>
            </select>
            <select
              v-model="pickupTimeParts.p"
              aria-label="AM o PM"
              aria-labelledby="pickup-time-label"
              class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <div
          v-if="pickupTimeOutOfHours"
          class="w-full flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[12px] text-amber-700"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-4 w-4 shrink-0 mt-0.5 text-amber-500"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span
            >La hora seleccionada está fuera del horario de atención
            <strong>(8:00 AM – 7:59 PM)</strong>. Por favor elige una hora
            dentro del rango para continuar.</span
          >
        </div>
      </div>
    </div>
  </fieldset>
</template>
