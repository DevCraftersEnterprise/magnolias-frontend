<script setup lang="ts">
type CommonAddress = {
  id: string;
  name: string;
  street: string;
  number: string;
  neighborhood: string;
};

defineProps<{
  step2: {
    isEvento: boolean;
    useCommonAddr: boolean;
    commonAddrId: string;
    useCustomerAddr: boolean;
    newAddr: {
      street: string;
      number: string;
      neighborhood: string;
      city: string;
      postalCode: string;
      betweenStreets: string;
      interphoneCode: string;
      reference: string;
    };
    saveAsCommonAddr: boolean;
    commonAddrName: string;
    receiverName: string;
    receiverPhone: string;
    deliveryNotes: string;
  };
  commonAddresses: CommonAddress[];
  customerHasAddress: boolean;
  customerAddressFormatted: string;
  onPhoneInput: (e: Event, setter: (v: string) => void) => void;
}>();
</script>

<template>
  <fieldset class="space-y-3">
    <legend
      class="text-[13px] font-semibold text-gray-500 uppercase tracking-wide mb-3"
    >
      Dirección de entrega
    </legend>

    <!-- Evento: selector de dirección común (salón de fiestas) -->
    <template v-if="step2.isEvento">
      <label class="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          v-model="step2.useCommonAddr"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
        />
        <span class="text-[13px] text-gray-700"
          >Usar dirección común (salón de fiestas)</span
        >
      </label>
      <div v-if="step2.useCommonAddr" class="flex flex-col gap-1">
        <div class="relative">
          <select
            v-model="step2.commonAddrId"
            class="w-full appearance-none rounded-xl bg-white pl-3 pr-9 py-2 text-[13px] text-[#111827] outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-[#FC9AD3]/60 cursor-pointer"
          >
            <option value="" disabled>Selecciona dirección</option>
            <option v-for="a in commonAddresses" :key="a.id" :value="a.id">
              {{ a.name }} — {{ a.street }} {{ a.number }},
              {{ a.neighborhood }}
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
    </template>

    <!-- Checkbox: usar dirección del cliente (oculto para evento con dirección común) -->
    <template v-if="!(step2.isEvento && step2.useCommonAddr)">
      <label
        :class="[
          'flex items-center gap-2.5 cursor-pointer select-none',
          !customerHasAddress && 'opacity-40 pointer-events-none',
        ]"
      >
        <input
          v-model="step2.useCustomerAddr"
          type="checkbox"
          :disabled="!customerHasAddress"
          class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
        />
        <span class="text-[13px] text-gray-700">
          Usar la dirección del cliente registrada
          <span v-if="!customerHasAddress" class="text-gray-400"
            >(el cliente no tiene dirección registrada)</span
          >
        </span>
      </label>

      <!-- Dirección pre-rellenada del cliente -->
      <div
        v-if="step2.useCustomerAddr && customerHasAddress"
        class="rounded-lg bg-pink-50 border border-[#FC9AD3]/40 px-4 py-3 flex items-start gap-2"
      >
        <svg
          viewBox="0 0 24 24"
          class="h-4 w-4 mt-0.5 flex-shrink-0 text-[#C9007C]"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        <span class="text-[13px] text-gray-700">{{
          customerAddressFormatted
        }}</span>
      </div>

      <!-- Manual address form -->
      <template v-if="!step2.useCustomerAddr">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1">
            <label class="text-[13px] font-medium text-gray-600">
              Calle <span class="text-red-400">*</span>
            </label>
            <input
              v-model="step2.newAddr.street"
              type="text"
              placeholder="Av. Principal"
              class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[13px] font-medium text-gray-600">
              Número exterior <span class="text-red-400">*</span>
            </label>
            <input
              v-model="step2.newAddr.number"
              type="text"
              placeholder="123"
              class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[13px] font-medium text-gray-600">
              Colonia <span class="text-red-400">*</span>
            </label>
            <input
              v-model="step2.newAddr.neighborhood"
              type="text"
              placeholder="Col. Centro"
              class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[13px] font-medium text-gray-600"
              >Ciudad</label
            >
            <input
              v-model="step2.newAddr.city"
              type="text"
              placeholder="CDMX"
              class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[13px] font-medium text-gray-600"
              >Código postal</label
            >
            <input
              v-model="step2.newAddr.postalCode"
              type="text"
              maxlength="5"
              placeholder="06600"
              class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
            />
          </div>
        </div>

        <!-- Additional address fields -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div class="flex flex-col gap-1">
            <label class="text-[13px] font-medium text-gray-600"
              >Entre calles</label
            >
            <input
              v-model="step2.newAddr.betweenStreets"
              type="text"
              placeholder="Entre Av. A y Av. B"
              class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[13px] font-medium text-gray-600"
              >Código de interfón</label
            >
            <input
              v-model="step2.newAddr.interphoneCode"
              type="text"
              placeholder="#1234"
              class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
            />
          </div>
          <div class="flex flex-col gap-1 sm:col-span-2">
            <label class="text-[13px] font-medium text-gray-600"
              >Referencia</label
            >
            <input
              v-model="step2.newAddr.reference"
              type="text"
              placeholder="Casa color azul, junto a la tienda..."
              class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
            />
          </div>
        </div>

        <!-- Evento: guardar como dirección común -->
        <template v-if="step2.isEvento">
          <label
            class="flex items-center gap-2.5 cursor-pointer select-none mt-1"
          >
            <input
              v-model="step2.saveAsCommonAddr"
              type="checkbox"
              class="h-4 w-4 rounded border-gray-300 text-[#FC9AD3] focus:ring-[#FC9AD3]/50"
            />
            <span class="text-[13px] text-gray-700"
              >Guardar como dirección común</span
            >
          </label>
          <div v-if="step2.saveAsCommonAddr" class="flex flex-col gap-1">
            <label class="text-[13px] font-medium text-gray-600"
              >Nombre del lugar</label
            >
            <input
              v-model="step2.commonAddrName"
              type="text"
              placeholder="Ej. Salón La Estancia"
              class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
            />
          </div>
        </template>
      </template>
    </template>

    <!-- Delivery overrides (always shown when address is set) -->
    <div
      v-if="
        step2.useCustomerAddr ||
        (step2.newAddr.street && step2.newAddr.number) ||
        (step2.isEvento && step2.useCommonAddr && step2.commonAddrId)
      "
      class="border-t border-dashed border-black/10 pt-4 space-y-3"
    >
      <p
        class="text-[12px] font-semibold text-gray-400 uppercase tracking-wide"
      >
        Para esta entrega (opcional)
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-medium text-gray-600"
            >Nombre de quien recibe</label
          >
          <input
            v-model="step2.receiverName"
            type="text"
            placeholder="Nombre del receptor"
            class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-[13px] font-medium text-gray-600"
            >Teléfono de quien recibe</label
          >
          <input
            :value="step2.receiverPhone"
            @input="onPhoneInput($event, (v) => (step2.receiverPhone = v))"
            @keydown="
              (e) => {
                if (
                  e.key.length === 1 &&
                  !/\d/.test(e.key) &&
                  !e.ctrlKey &&
                  !e.metaKey
                )
                  e.preventDefault();
              }
            "
            type="tel"
            inputmode="numeric"
            maxlength="10"
            placeholder="5512345678"
            :class="[
              'rounded-lg border px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white',
              step2.receiverPhone && step2.receiverPhone.length !== 10
                ? 'border-red-300'
                : 'border-black/15',
            ]"
          />
          <p
            v-if="step2.receiverPhone && step2.receiverPhone.length !== 10"
            class="text-[11px] text-red-500"
          >
            Debe tener exactamente 10 dígitos
          </p>
        </div>
        <div class="flex flex-col gap-1 sm:col-span-2">
          <label class="text-[13px] font-medium text-gray-600"
            >Indicaciones para el repartidor</label
          >
          <textarea
            v-model="step2.deliveryNotes"
            rows="2"
            placeholder="Instrucciones especiales para la entrega..."
            class="rounded-lg border border-black/15 px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FC9AD3]/60 bg-white resize-none"
          />
        </div>
      </div>
    </div>
  </fieldset>
</template>
