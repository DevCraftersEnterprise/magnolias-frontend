<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Panel · Magnolias' })

const orderSummary = [
  {
    key: 'created',
    label: 'Creados',
    value: 5,
    icon: 'created',
  },
  {
    key: 'in_process',
    label: 'En proceso',
    value: 0,
    icon: 'process',
  },
  {
    key: 'done',
    label: 'Terminados',
    value: 0,
    icon: 'done',
  },
  {
    key: 'delivered',
    label: 'Entregados',
    value: 0,
    icon: 'delivered',
  },
  {
    key: 'cancelled',
    label: 'Cancelados',
    value: 0,
    icon: 'cancelled',
  },
]
</script>

<template>
  <section>
    <div
      class="rounded-[28px] border border-[#F3DCE8] bg-white p-5 shadow-[0_10px_24px_rgba(226,184,206,0.16)] sm:p-6"
    >
      <div class="mb-5">
        <h2 class="text-[20px] font-bold text-[#1E1E1E]">
          Resumen general de pedidos
        </h2>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div
          v-for="item in orderSummary"
          :key="item.key"
          class="rounded-3xl border border-[#F3DCE8] bg-white p-4 shadow-[0_10px_24px_rgba(226,184,206,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(226,184,206,0.22)]"
        >
          <div class="flex items-start justify-between gap-3">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFBEE6] text-[#B86B98]"
            >
              <!-- Creados -->
              <svg
                v-if="item.icon === 'created'"
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>

              <!-- En proceso -->
              <svg
                v-else-if="item.icon === 'process'"
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 6v6l4 2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>

              <!-- Terminados -->
              <svg
                v-else-if="item.icon === 'done'"
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12l4 4L19 7"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <!-- Entregados -->
              <svg
                v-else-if="item.icon === 'delivered'"
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3 7h11v8H3z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M14 10h3l2 2v3h-5z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <circle cx="7" cy="18" r="1.6" fill="currentColor" />
                <circle cx="17" cy="18" r="1.6" fill="currentColor" />
              </svg>

              <!-- Cancelados -->
              <svg
                v-else
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M9 9l6 6M15 9l-6 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </div>

            <span
              class="rounded-full bg-[#FFF4FA] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#B58A9F]"
            >
              Pedidos
            </span>
          </div>

          <div class="mt-4">
            <p class="text-[13px] font-semibold text-[#9A8A90]">
              {{ item.label }}
            </p>
            <p class="mt-1 text-3xl font-bold text-[#1E1E1E]">
              {{ item.value }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>