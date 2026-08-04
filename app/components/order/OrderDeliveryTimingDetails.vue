<script setup lang="ts">
defineProps<{
  step2: {
    isEvento: boolean;
    deliveryRound: string;
    deliveryDate: string;
    eventMontageDate: string;
  };
  deliveryTimeParts: { h: number; m: string; p: "AM" | "PM" };
  exitTimeParts: { h: number; m: string; p: "AM" | "PM" };
  minDeliveryDate: string;
  deliveryTimeOutOfHours: boolean;
  deliveryTimeWarningMsg: string;
  exitTimeOutOfHours: boolean;
  minuteOptions: readonly string[];
}>();
</script>

<template>
  <fieldset class="space-y-0">
    <legend
      class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3"
    >
      {{ step2.isEvento ? "Logística del evento" : "Detalles de la entrega" }}
    </legend>
    <div
      class="divide-y divide-black/8 rounded-xl border border-black/10 overflow-hidden"
    >
      <!-- Ronda de entrega -->
      <div class="flex items-center gap-3 px-4 py-3 bg-white">
        <svg
          viewBox="0 0 24 24"
          class="h-5 w-5 flex-shrink-0 text-[#FC9AD3]"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <label class="text-[13px] font-medium text-gray-700 w-36 flex-shrink-0"
          >Ronda de entrega</label
        >
        <div class="relative flex-1">
          <select
            v-model="step2.deliveryRound"
            class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
          >
            <option value="" disabled>Selecciona ronda</option>
            <option value="1">Ronda 1</option>
            <option value="2">Ronda 2</option>
            <option value="3">Ronda 3</option>
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
          <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">
            {{ step2.isEvento ? "Fecha del evento" : "Fecha de entrega" }}
            <span class="text-red-400">*</span>
          </label>
          <input
            v-model="step2.deliveryDate"
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
          <label class="text-[13px] font-medium text-gray-700 flex-shrink-0">
            {{ step2.isEvento ? "Hora del evento" : "Hora de entrega" }}
          </label>
          <div class="flex items-center gap-1">
            <select
              v-model.number="deliveryTimeParts.h"
              class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"
            >
              <option v-for="h in 12" :key="h" :value="h">
                {{ h }}
              </option>
            </select>
            <span class="text-gray-400 text-[13px] font-medium">:</span>
            <select
              v-model="deliveryTimeParts.m"
              class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"
            >
              <option v-for="m in minuteOptions" :key="m" :value="m">
                {{ m }}
              </option>
            </select>
            <select
              v-model="deliveryTimeParts.p"
              class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <div
          v-if="deliveryTimeOutOfHours"
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
          <span>{{ deliveryTimeWarningMsg }}</span>
        </div>
      </div>

      <!-- Hora del montaje + Hora de salida (evento) -->
      <div
        v-if="step2.isEvento"
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
          <label class="text-[13px] font-medium text-gray-700 flex-shrink-0"
            >Fecha del montaje</label
          >
          <input
            v-model="step2.eventMontageDate"
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
          <label class="text-[13px] font-medium text-gray-700 flex-shrink-0"
            >Hora de salida</label
          >
          <div class="flex items-center gap-1">
            <select
              v-model.number="exitTimeParts.h"
              class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"
            >
              <option v-for="h in 12" :key="h" :value="h">
                {{ h }}
              </option>
            </select>
            <span class="text-gray-400 text-[13px] font-medium">:</span>
            <select
              v-model="exitTimeParts.m"
              class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"
            >
              <option v-for="m in minuteOptions" :key="m" :value="m">
                {{ m }}
              </option>
            </select>
            <select
              v-model="exitTimeParts.p"
              class="appearance-none rounded-lg border border-black/12 px-2 py-1.5 text-[13px] text-[#111827] outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white cursor-pointer"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <div
          v-if="exitTimeOutOfHours"
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
            >La hora de salida parece muy temprana (antes de las 7:00 AM).
            ¿Estás seguro?</span
          >
        </div>
      </div>
    </div>
  </fieldset>
</template>
