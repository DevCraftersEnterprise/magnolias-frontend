<script setup lang="ts">
type AddressForm = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  postalCode: string;
  interphoneCode: string;
  betweenStreets: string;
  reference: string;
  notes: string;
};

export type CustomerCreateForm = {
  fullName: string;
  phone: string;
  alternativePhone: string;
  email: string;
  notes: string;
  withAddress: boolean;
  address: AddressForm;
};

const props = defineProps<{
  modelValue: boolean;
  mode?: "create" | "edit";
  model: CustomerCreateForm | null;
  title?: string;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "save", model: CustomerCreateForm): void;
  (e: "delete"): void;
}>();

/** v-model del modal */
const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

/** ✅ Lock scroll del body (solo cliente) */
watch(
  () => open.value,
  (isOpen) => {
    if (!process.client) return;
    document.body.style.overflow = isOpen ? "hidden" : "";
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (!process.client) return;
  document.body.style.overflow = "";
});

/** Modelo interno */
const m = reactive<CustomerCreateForm>({
  fullName: "",
  phone: "",
  alternativePhone: "",
  email: "",
  notes: "",
  withAddress: false,
  address: {
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    postalCode: "",
    interphoneCode: "",
    betweenStreets: "",
    reference: "",
    notes: "",
  },
});

/** Cargar model del padre al abrir/actualizar */
watch(
  () => props.model,
  (v) => {
    if (!v) return;
    Object.assign(m, v);
    Object.assign(m.address, v.address);
  },
  { immediate: true },
);

/** Detectar si tenía dirección al inicio (para warning) */
const hadAddressInitially = ref(false);

watch(
  () => props.model,
  (v) => {
    hadAddressInitially.value = !!v?.withAddress;
  },
  { immediate: true },
);

/** Warning si en edit apagan toggle (borra dirección) */
const willRemoveAddress = computed(
  () => props.mode === "edit" && hadAddressInitially.value && !m.withAddress,
);

/** Validación */
const canSave = computed(() => {
  if (!m.fullName.trim()) return false;
  if (!m.phone.trim()) return false;
  if (!m.withAddress) return true;
  if (!m.address.street.trim()) return false;
  if (!m.address.number.trim()) return false;
  if (!m.address.neighborhood.trim()) return false;
  return true;
});

function close() {
  open.value = false;
}

function submit() {
  if (!canSave.value) return;
  emit("save", JSON.parse(JSON.stringify(m)));
}
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[60]">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/30" @click="close"></div>

      <!-- Wrapper: NO SCROLL aquí, solo centra y limita alto -->
      <div class="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <!-- Panel: altura máxima + layout en 3 filas (header, body scroll, footer) -->
        <div
          class="w-full max-w-[720px] rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden max-h-[calc(100vh-32px)] sm:max-h-[calc(100vh-48px)] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <!-- Header fijo -->
          <div
            class="px-6 py-4 border-b border-black/10 flex items-center justify-between shrink-0"
          >
            <div>
              <p class="text-[12px] text-gray-500">Clientes</p>
              <h3 class="text-[18px] font-semibold text-[#111827]">
                {{ title || "Agregar cliente" }}
              </h3>
            </div>

            <button
              class="h-9 w-9 rounded-xl hover:bg-black/5 grid place-items-center"
              @click="close"
              aria-label="Cerrar"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body con scroll interno -->
          <div class="p-6 space-y-5 overflow-y-auto flex-1">
            <!-- Datos principales -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label
                  class="block text-[12px] font-semibold text-gray-600 mb-1"
                  >Nombre completo *</label
                >
                <input
                  v-model="m.fullName"
                  class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div>
                <label
                  class="block text-[12px] font-semibold text-gray-600 mb-1"
                  >Teléfono *</label
                >
                <input
                  v-model="m.phone"
                  inputmode="tel"
                  class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  placeholder="Ej. +52 644 123 4567"
                />
              </div>

              <div>
                <label
                  class="block text-[12px] font-semibold text-gray-600 mb-1"
                  >Teléfono alternativo (opcional)</label
                >
                <input
                  v-model="m.alternativePhone"
                  inputmode="tel"
                  class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  placeholder="Ej. +52 644 999 8888"
                />
              </div>

              <div class="sm:col-span-2">
                <label
                  class="block text-[12px] font-semibold text-gray-600 mb-1"
                  >Correo (opcional)</label
                >
                <input
                  v-model="m.email"
                  inputmode="email"
                  class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  placeholder="Ej. juan.perez@example.com"
                />
              </div>

              <div class="sm:col-span-2">
                <label
                  class="block text-[12px] font-semibold text-gray-600 mb-1"
                  >Notas (opcional)</label
                >
                <textarea
                  v-model="m.notes"
                  rows="3"
                  class="w-full rounded-xl px-4 py-3 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none resize-none"
                  placeholder="Ej. Cliente frecuente, prefiere entregas matutinas"
                />
              </div>
            </div>

            <!-- Toggle dirección -->
            <div
              class="flex items-center justify-between rounded-2xl bg-[#FAFAFB] ring-1 ring-black/10 px-4 py-3"
            >
              <div class="pr-4">
                <p class="text-[13px] font-semibold text-[#111827]">
                  Agregar dirección
                </p>
                <p class="text-[12px] text-gray-500">
                  Si activas esto, solo calle, número y colonia son
                  obligatorios.
                </p>
              </div>

              <button
                type="button"
                class="relative inline-flex h-7 w-12 items-center rounded-full transition"
                :class="m.withAddress ? 'bg-[#111827]' : 'bg-black/20'"
                @click="m.withAddress = !m.withAddress"
                aria-label="Toggle dirección"
              >
                <span
                  class="inline-block h-5 w-5 transform rounded-full bg-white transition"
                  :class="m.withAddress ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
            <div
              v-if="willRemoveAddress"
              class="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber-800 ring-1 ring-amber-200"
            >
              Al guardar, la dirección actual del cliente se eliminará.
            </div>

            <!-- Dirección -->
            <div
              v-if="m.withAddress"
              class="rounded-2xl ring-1 ring-black/10 p-4"
            >
              <p class="text-[13px] font-semibold text-[#111827] mb-3">
                Dirección
              </p>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-[12px] font-semibold text-gray-600 mb-1"
                    >Calle *</label
                  >
                  <input
                    v-model="m.address.street"
                    class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label
                    class="block text-[12px] font-semibold text-gray-600 mb-1"
                    >Número *</label
                  >
                  <input
                    v-model="m.address.number"
                    class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label
                    class="block text-[12px] font-semibold text-gray-600 mb-1"
                    >Colonia *</label
                  >
                  <input
                    v-model="m.address.neighborhood"
                    class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label
                    class="block text-[12px] font-semibold text-gray-600 mb-1"
                    >Ciudad (opcional)</label
                  >
                  <input
                    v-model="m.address.city"
                    class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label
                    class="block text-[12px] font-semibold text-gray-600 mb-1"
                    >CP (opcional)</label
                  >
                  <input
                    v-model="m.address.postalCode"
                    inputmode="numeric"
                    class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  />
                </div>

                <div>
                  <label
                    class="block text-[12px] font-semibold text-gray-600 mb-1"
                    >Código interfon (opcional)</label
                  >
                  <input
                    v-model="m.address.interphoneCode"
                    class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                    placeholder="Ej. 1234#"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label
                    class="block text-[12px] font-semibold text-gray-600 mb-1"
                    >Entre calles (opcional)</label
                  >
                  <input
                    v-model="m.address.betweenStreets"
                    class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label
                    class="block text-[12px] font-semibold text-gray-600 mb-1"
                    >Referencia (opcional)</label
                  >
                  <input
                    v-model="m.address.reference"
                    class="w-full h-11 rounded-xl px-4 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none"
                    placeholder="Ej. Cerca del parque"
                  />
                </div>

                <div class="sm:col-span-2">
                  <label
                    class="block text-[12px] font-semibold text-gray-600 mb-1"
                    >Notas dirección (opcional)</label
                  >
                  <textarea
                    v-model="m.address.notes"
                    rows="2"
                    class="w-full rounded-xl px-4 py-3 text-[14px] ring-1 ring-black/10 focus:ring-2 focus:ring-black/10 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Footer fijo -->
          <div
            class="px-6 py-4 border-t border-black/10 flex items-center justify-between shrink-0"
          >
            <p class="text-[12px] text-gray-500">
              Los campos con * son obligatorios.
            </p>

            <div class="flex items-center gap-2">
              <button
                v-if="props.mode === 'edit'"
                type="button"
                class="h-10 px-4 rounded-xl text-[13px] font-semibold bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 transition disabled:opacity-60"
                :disabled="saving"
                @click="emit('delete')"
                title="Eliminar cliente"
              >
                <span class="inline-flex items-center gap-2">
                  <svg
                    viewBox="0 0 24 24"
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                  Eliminar
                </span>
              </button>
              <button
                type="button"
                class="h-10 px-4 rounded-xl text-[13px] font-semibold bg-[#E9EAED] text-[#111827] hover:bg-[#DDE0E6] transition"
                @click="close"
                :disabled="saving"
              >
                Cancelar
              </button>

              <button
                type="button"
                class="h-10 px-4 rounded-xl text-[13px] font-semibold bg-[#111827] text-white hover:bg-black transition disabled:opacity-60"
                :disabled="!canSave || saving"
                @click="submit"
              >
                {{ saving ? "Guardando…" : "Guardar" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
