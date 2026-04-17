<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && order"
        class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/60" @click="emit('close')" />

        <!-- Panel -->
        <div class="relative w-full max-w-xl my-4 sm:my-6">
          <div
            class="rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden"
          >
            <!-- ── Header ── -->
            <div
              class="px-6 pt-5 pb-4 border-b border-black/10 flex items-start justify-between gap-3"
            >
              <div>
                <p
                  class="text-[10px] font-bold tracking-widest text-gray-400 uppercase"
                >
                  Detalle del pedido
                </p>
                <h3 class="mt-1 text-[18px] font-bold text-[#111827]">
                  {{ order.orderCode }}
                </h3>
              </div>
              <div class="flex items-center gap-2 shrink-0 pt-0.5">
                <span
                  class="inline-flex rounded-full px-3 py-1 text-[12px] font-semibold"
                  :style="{
                    backgroundColor: STATUS_COLORS[order.status]?.bg,
                    color: STATUS_COLORS[order.status]?.text,
                  }"
                >
                  {{ STATUS_LABELS[order.status] }}
                </span>
                <!-- Descargar formato -->
                <button
                  type="button"
                  class="grid h-8 w-8 place-items-center rounded-xl hover:bg-black/5 text-gray-400 transition"
                  :title="'Descargar formato'"
                  :disabled="downloading"
                  @click="downloadFormat()"
                >
                  <svg v-if="downloading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 1 0 10 10" stroke-linecap="round" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-linecap="round" />
                    <polyline points="7 10 12 15 17 10" stroke-linecap="round" stroke-linejoin="round" />
                    <line x1="12" y1="15" x2="12" y2="3" stroke-linecap="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="grid h-8 w-8 place-items-center rounded-xl hover:bg-black/5 text-gray-400 transition"
                  aria-label="Cerrar"
                  @click="emit('close')"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Loading detail -->
            <div v-if="loadingDetail" class="py-16 flex justify-center">
              <div
                class="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#C9007C]"
              ></div>
            </div>

            <!-- ── Body ── -->
            <div
              v-else
              class="overflow-y-auto max-h-[72vh] px-6 py-5 space-y-5"
            >
              <!-- ─ 1. Resumen ─ -->
              <div>
                <p
                  class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                >
                  Resumen
                </p>
                <div class="rounded-xl bg-[#F8F8F9] px-4 py-4 space-y-4">
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                      <p class="text-[11px] text-gray-400">Fecha de entrega</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">
                        {{ formatDate(order.deliveryDate) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-[11px] text-gray-400">Hora</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">
                        {{
                          activeData?.deliveryTime ?? order.deliveryTime ?? "—"
                        }}
                      </p>
                    </div>
                    <div>
                      <p class="text-[11px] text-gray-400">Tipo</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">
                        {{
                          typeLabel(activeData?.orderType ?? order.orderType) ||
                          "—"
                        }}
                      </p>
                    </div>
                    <div v-if="activeData?.deliveryRound">
                      <p class="text-[11px] text-gray-400">Ronda</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">
                        {{ roundLabel(activeData.deliveryRound) }}
                      </p>
                    </div>
                    <div v-if="activeData?.paymentMethod">
                      <p class="text-[11px] text-gray-400">Pago</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">
                        {{ paymentLabel(activeData.paymentMethod) }}
                      </p>
                    </div>
                    <div v-if="activeData?.branch">
                      <p class="text-[11px] text-gray-400">Sucursal</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">
                        {{ activeData.branch.name }}
                      </p>
                    </div>
                    <div
                      v-if="
                        activeData?.requiresInvoice ||
                        activeData?.isCustomerPickup
                      "
                      class="col-span-2 sm:col-span-3 flex gap-3"
                    >
                      <span
                        v-if="activeData.requiresInvoice"
                        class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-600"
                      >
                        Requiere factura
                      </span>
                      <span
                        v-if="activeData.isCustomerPickup"
                        class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-600"
                      >
                        Recoge en tienda
                      </span>
                    </div>
                  </div>
                  <!-- Montos -->
                  <div
                    class="border-t border-black/10 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3"
                  >
                    <div>
                      <p class="text-[11px] text-gray-400">Total</p>
                      <p class="mt-0.5 text-[18px] font-bold text-[#111827]">
                        {{
                          activeData?.totalAmount ?? order.totalAmount ?? "—"
                        }}
                      </p>
                    </div>
                    <div>
                      <p class="text-[11px] text-gray-400">Anticipo</p>
                      <p
                        class="mt-0.5 text-[14px] font-semibold text-[#111827]"
                      >
                        {{
                          activeData?.advancePayment ??
                          order.advancePayment ??
                          "—"
                        }}
                      </p>
                    </div>
                    <div>
                      <p class="text-[11px] text-gray-400">Saldo restante</p>
                      <p
                        class="mt-0.5 text-[14px] font-semibold text-[#C9007C]"
                      >
                        {{
                          activeData?.remainingBalance ??
                          order.remainingBalance ??
                          "—"
                        }}
                      </p>
                    </div>
                    <div
                      v-if="
                        activeData?.setupServiceCost &&
                        activeData.setupServiceCost !== '$0.00'
                      "
                    >
                      <p class="text-[11px] text-gray-400">Costo montaje</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">
                        {{ activeData.setupServiceCost }}
                      </p>
                    </div>
                    <div
                      v-if="
                        activeData?.dessertsTotal &&
                        activeData.dessertsTotal !== '$0.00'
                      "
                    >
                      <p class="text-[11px] text-gray-400">Postres</p>
                      <p class="mt-0.5 text-[13px] font-medium text-[#111827]">
                        {{ activeData.dessertsTotal }}
                      </p>
                    </div>
                  </div>

                  <!-- ── Abono rápido ────────────────────────────────── -->
                  <div class="border-t border-black/10 pt-4">
                    <div
                      v-if="isPaid"
                      class="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 ring-1 ring-green-200"
                    >
                      <svg
                        class="h-4 w-4 shrink-0 text-green-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <p class="text-[13px] font-semibold text-green-700">
                        Pedido pagado completamente
                      </p>
                    </div>
                    <template v-else>
                      <p
                        class="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3"
                      >
                        Registrar abono
                      </p>
                      <div class="flex items-center gap-2">
                        <div
                          class="flex items-center h-10 flex-1 rounded-xl bg-[#F8F8F9] ring-1 ring-black/10 overflow-hidden focus-within:ring-2 focus-within:ring-[#FC9AD3]/60"
                        >
                          <span
                            class="px-3 text-[13px] text-gray-400 font-medium border-r border-black/10 h-full flex items-center"
                            >$</span
                          >
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            :max="remainingParsed"
                            v-model="abonoAmount"
                            placeholder="0.00"
                            class="flex-1 bg-transparent px-3 text-[14px] font-semibold text-[#111827] outline-none"
                            @keydown.enter="saveAbono"
                          />
                        </div>
                        <button
                          type="button"
                          :disabled="
                            !abonoAmount ||
                            Number(abonoAmount) <= 0 ||
                            abonoSaving
                          "
                          class="h-10 px-4 rounded-xl text-[13px] font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                          style="background-color: #fc9ad3"
                          @click="saveAbono"
                        >
                          <div
                            v-if="abonoSaving"
                            class="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                          />
                          <span v-else>Guardar</span>
                        </button>
                      </div>
                      <p
                        v-if="abonoError"
                        class="mt-2 text-[12px] text-red-600"
                      >
                        {{ abonoError }}
                      </p>
                      <p
                        v-if="abonoSuccess"
                        class="mt-2 text-[12px] font-semibold text-green-600"
                      >
                        ✓ Abono registrado correctamente
                      </p>
                    </template>
                  </div>
                </div>
              </div>

              <!-- ─ 2. Dirección de entrega ─ -->
              <div v-if="activeDeliveryAddress">
                <p
                  class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                >
                  Dirección de entrega
                </p>
                <div class="rounded-xl bg-[#F8F8F9] px-4 py-4 space-y-3">
                  <!-- Receptor -->
                  <div
                    v-if="activeDeliveryAddress.receiverName"
                    class="flex items-center gap-3"
                  >
                    <div
                      class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-100"
                    >
                      <svg
                        class="h-4 w-4 text-pink-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-[13px] font-semibold text-[#111827]">
                        {{ activeDeliveryAddress.receiverName }}
                      </p>
                      <p
                        v-if="activeDeliveryAddress.receiverPhone"
                        class="text-[12px] text-gray-500"
                      >
                        {{ activeDeliveryAddress.receiverPhone }}
                      </p>
                    </div>
                  </div>
                  <!-- Dirección -->
                  <div
                    v-if="buildDeliveryAddress"
                    class="flex items-start gap-3"
                  >
                    <div
                      class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-pink-100"
                    >
                      <svg
                        class="h-4 w-4 text-pink-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                        />
                      </svg>
                    </div>
                    <div class="pt-1 space-y-0.5">
                      <p class="text-[13px] text-gray-700 leading-relaxed">
                        {{ buildDeliveryAddress }}
                      </p>
                      <p
                        v-if="activeDeliveryAddress.postalCode"
                        class="text-[12px] text-gray-500"
                      >
                        CP {{ activeDeliveryAddress.postalCode }}
                      </p>
                      <p
                        v-if="activeDeliveryAddress.betweenStreets"
                        class="text-[12px] text-gray-500"
                      >
                        Entre: {{ activeDeliveryAddress.betweenStreets }}
                      </p>
                      <p
                        v-if="activeDeliveryAddress.interphoneCode"
                        class="text-[12px] text-gray-500"
                      >
                        Interfón: {{ activeDeliveryAddress.interphoneCode }}
                      </p>
                      <p
                        v-if="activeDeliveryAddress.reference"
                        class="text-[12px] text-gray-500"
                      >
                        Ref: {{ activeDeliveryAddress.reference }}
                      </p>
                    </div>
                  </div>
                  <!-- Notas de entrega -->
                  <div
                    v-if="activeDeliveryAddress.deliveryNotes"
                    class="ml-11 rounded-lg bg-white px-3 py-2 ring-1 ring-black/5 text-[12px] text-gray-500 italic"
                  >
                    Nota: {{ activeDeliveryAddress.deliveryNotes }}
                  </div>
                </div>
              </div>

              <!-- ─ 3. Cliente ─ -->
              <div v-if="activeCustomer">
                <p
                  class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                >
                  Cliente
                </p>
                <div class="rounded-xl bg-[#F8F8F9] px-4 py-4 space-y-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E6ABFA] font-bold text-[13px] text-[#7C00C9]"
                    >
                      {{ nameInitials(activeCustomer.fullName) }}
                    </div>
                    <div>
                      <p class="text-[14px] font-semibold text-[#111827]">
                        {{ activeCustomer.fullName }}
                      </p>
                      <p class="text-[12px] text-gray-500">
                        {{ activeCustomer.phone ?? "—" }}
                      </p>
                    </div>
                  </div>
                  <div class="space-y-1.5 ml-12">
                    <div
                      v-if="activeCustomer.alternativePhone"
                      class="flex items-center gap-1.5 text-[12px] text-gray-500"
                    >
                      <svg
                        class="h-3.5 w-3.5 shrink-0 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.39 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                        />
                      </svg>
                      Alt: {{ activeCustomer.alternativePhone }}
                    </div>
                    <div
                      v-if="activeCustomer.email"
                      class="flex items-center gap-1.5 text-[12px] text-gray-500"
                    >
                      <svg
                        class="h-3.5 w-3.5 shrink-0 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      {{ activeCustomer.email }}
                    </div>
                    <div
                      v-if="buildCustomerAddress"
                      class="flex items-center gap-1.5 text-[12px] text-gray-500"
                    >
                      <svg
                        class="h-3.5 w-3.5 shrink-0 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                        />
                      </svg>
                      {{ buildCustomerAddress }}
                    </div>
                    <div
                      v-if="activeCustomer.notes"
                      class="rounded-lg bg-white px-3 py-2 ring-1 ring-black/5 text-[12px] text-gray-500 italic"
                    >
                      {{ activeCustomer.notes }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- ─ 4. Productos del pedido ─ -->
              <div v-if="activeData && activeData.details.length > 0">
                <p
                  class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                >
                  Productos ({{ activeData.details.length }})
                </p>
                <div class="space-y-3">
                  <div
                    v-for="(detail, i) in activeData.details"
                    :key="detail.id"
                    class="rounded-xl bg-[#F8F8F9] overflow-hidden ring-1 ring-black/5"
                  >
                    <!-- Image -->
                    <div v-if="detail.referenceImageUrl" class="w-full">
                      <img
                        :src="detail.referenceImageUrl"
                        alt="Referencia"
                        class="w-full max-h-52 object-cover bg-gray-100"
                      />
                    </div>
                    <div class="px-4 py-3 space-y-2">
                      <!-- Product name + qty/price -->
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <p class="text-[13px] font-semibold text-[#111827]">
                            {{ detail.product?.name ?? `Producto ${i + 1}` }}
                          </p>
                          <p
                            v-if="detail.product?.description"
                            class="text-[11px] text-gray-400"
                          >
                            {{ detail.product.description }}
                          </p>
                        </div>
                        <div class="text-right shrink-0">
                          <p class="text-[13px] font-bold text-[#111827]">
                            {{ detail.price }}
                          </p>
                          <p class="text-[11px] text-gray-400">
                            × {{ detail.quantity }}
                          </p>
                        </div>
                      </div>
                      <!-- Attributes grid -->
                      <div
                        class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 pt-1"
                      >
                        <div v-if="detail.productSize || detail.customSize">
                          <p class="text-[10px] text-gray-400">Tamaño</p>
                          <p class="text-[12px] text-gray-700">
                            {{ detail.productSize ?? detail.customSize }}
                          </p>
                        </div>
                        <div v-if="detail.flavor">
                          <p class="text-[10px] text-gray-400">Sabor</p>
                          <p class="text-[12px] text-gray-700">
                            {{ detail.flavor.name }}
                          </p>
                        </div>
                        <div v-if="detail.filling">
                          <p class="text-[10px] text-gray-400">Relleno</p>
                          <p class="text-[12px] text-gray-700">
                            {{ detail.filling.name }}
                          </p>
                        </div>
                        <div v-if="detail.frosting">
                          <p class="text-[10px] text-gray-400">Betún</p>
                          <p class="text-[12px] text-gray-700">
                            {{ detail.frosting.name }}
                          </p>
                        </div>
                        <div v-if="detail.breadType">
                          <p class="text-[10px] text-gray-400">Tipo de pan</p>
                          <p class="text-[12px] text-gray-700">
                            {{ detail.breadType.name }}
                          </p>
                        </div>
                        <div v-if="detail.color">
                          <p class="text-[10px] text-gray-400">Color</p>
                          <p class="text-[12px] text-gray-700">
                            {{ detail.color.name }}
                          </p>
                        </div>
                        <div v-if="detail.style">
                          <p class="text-[10px] text-gray-400">Estilo</p>
                          <p class="text-[12px] text-gray-700">
                            {{ detail.style.name }}
                          </p>
                        </div>
                      </div>
                      <!-- Writing -->
                      <div
                        v-if="detail.hasWriting"
                        class="rounded-lg bg-white px-3 py-2 ring-1 ring-black/5 space-y-0.5"
                      >
                        <p
                          class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide"
                        >
                          Texto en pastel
                        </p>
                        <p
                          v-if="detail.writingText"
                          class="text-[12px] text-gray-700 italic"
                        >
                          "{{ detail.writingText }}"
                        </p>
                        <p
                          v-if="detail.writingLocation"
                          class="text-[11px] text-gray-500"
                        >
                          Ubicación: {{ detail.writingLocation }}
                        </p>
                        <p
                          v-if="detail.pipingLocation"
                          class="text-[11px] text-gray-500"
                        >
                          Piping: {{ detail.pipingLocation }}
                        </p>
                      </div>
                      <!-- Notes -->
                      <div
                        v-if="detail.decorationNotes || detail.notes"
                        class="rounded-lg bg-white px-3 py-2 ring-1 ring-black/5 text-[12px] text-gray-500 italic space-y-0.5"
                      >
                        <p v-if="detail.decorationNotes">
                          Decoración: {{ detail.decorationNotes }}
                        </p>
                        <p v-if="detail.notes">Nota: {{ detail.notes }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ─ 5. Flores ─ -->
              <div v-if="activeData && activeData.orderFlowers && activeData.orderFlowers.length > 0">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Flores ({{ activeData.orderFlowers.length }})
                </p>
                <div class="rounded-xl bg-[#F8F8F9] px-4 py-3 space-y-2">
                  <div
                    v-for="(f, i) in activeData.orderFlowers"
                    :key="i"
                    class="flex items-center gap-2.5 text-[13px] text-[#111827]"
                  >
                    <span
                      class="inline-block h-3.5 w-3.5 rounded-full flex-shrink-0 ring-1 ring-black/15"
                      :style="{ background: f.color?.value ?? '#e5e7eb' }"
                    />
                    <span class="font-medium">{{ f.flower?.name ?? '—' }}</span>
                    <span v-if="f.color" class="text-gray-400 text-[12px]">· {{ f.color.name }}</span>
                    <span class="ml-auto text-gray-500 text-[12px]">× {{ f.quantity }}</span>
                  </div>
                </div>
              </div>

              <!-- ─ 6. Historial de pagos ─ -->
              <div v-if="activeData?.payments && activeData.payments.length > 0">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Historial de pagos
                </p>
                <div class="rounded-xl overflow-hidden ring-1 ring-black/[0.07]">
                  <div
                    v-for="(pay, i) in [...activeData.payments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())"
                    :key="pay.id"
                    class="flex items-center justify-between px-4 py-3 bg-white text-[13px]"
                    :class="i > 0 ? 'border-t border-black/[0.06]' : ''"
                  >
                    <div class="flex items-center gap-2.5">
                      <div class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-green-50 ring-1 ring-green-200">
                        <svg class="h-3.5 w-3.5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      </div>
                      <div>
                        <p class="font-semibold text-[#111827]">{{ pay.paidAmount }}</p>
                        <p class="text-[11px] text-gray-400">{{ formatDateTime(pay.createdAt) }}</p>
                      </div>
                    </div>
                    <span class="text-[11px] font-medium text-green-600 bg-green-50 rounded-full px-2.5 py-0.5 ring-1 ring-green-200">Abono</span>
                  </div>
                </div>
              </div>

              <!-- ─ Auditoría ─ -->
              <div
                v-if="activeCreatedBy || activeUpdatedBy"
                class="rounded-xl bg-[#FAFAFA] border border-black/5 px-4 py-3 space-y-1.5"
              >
                <div
                  v-if="activeCreatedBy"
                  class="flex items-center gap-1.5 text-[11px] text-gray-400"
                >
                  <svg
                    class="h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Creado por
                  <span class="font-semibold text-gray-500"
                    >{{ activeCreatedBy.name }}
                    {{ activeCreatedBy.lastname }}</span
                  >
                  · {{ formatDateTime(order.createdAt) }}
                </div>
                <div
                  v-if="activeUpdatedBy && order.updatedAt !== order.createdAt"
                  class="flex items-center gap-1.5 text-[11px] text-gray-400"
                >
                  <svg
                    class="h-3.5 w-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                  Actualizado por
                  <span class="font-semibold text-gray-500"
                    >{{ activeUpdatedBy.name }}
                    {{ activeUpdatedBy.lastname }}</span
                  >
                  · {{ formatDateTime(order.updatedAt) }}
                </div>
              </div>
            </div>
            <!-- /body -->
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  ordersService,
  STATUS_LABELS,
  STATUS_COLORS,
  TYPE_COLORS,
  TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  DELIVERY_ROUND_LABELS,
  type OrderItem,
  type OrderDetail,
  type OrderType,
} from "~/services/orders.service";

const props = defineProps<{
  open: boolean;
  order: OrderItem | null;
}>();

const emit = defineEmits<{ (e: "close"): void }>();

// ── Fetch full detail on open ────────────────────────────────────────────────
const activeData = ref<OrderDetail | null>(null);
const loadingDetail = ref(false);

watch(
  () => props.open,
  async (v) => {
    if (!v || !props.order) {
      activeData.value = null;
      return;
    }
    loadingDetail.value = true;
    try {
      activeData.value = await ordersService.getOrder(props.order.id);
    } catch {
      activeData.value = null; // fall back to list data
    } finally {
      loadingDetail.value = false;
    }
  },
);

// ── Escape key ───────────────────────────────────────────────────────────────
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape" && props.open) emit("close");
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

// ── Abono rápido ─────────────────────────────────────────────────────────────
const abonoAmount = ref<number | "">("");
const abonoSaving = ref(false);
const abonoError = ref("");
const abonoSuccess = ref(false);

const remainingParsed = computed(() => {
  const raw =
    activeData.value?.remainingBalance ?? props.order?.remainingBalance ?? "";
  return parseFloat(String(raw).replace(/[^0-9.]/g, "")) || 0;
});
const isPaid = computed(
  () => !!activeData.value && remainingParsed.value === 0,
);

watch(
  () => props.open,
  (v) => {
    if (!v) {
      abonoAmount.value = "";
      abonoError.value = "";
      abonoSuccess.value = false;
    }
  },
);

async function saveAbono() {
  const amount = Number(abonoAmount.value);
  if (!amount || amount <= 0 || !props.order) return;
  abonoSaving.value = true;
  abonoError.value = "";
  abonoSuccess.value = false;
  try {
    await ordersService.updateOrder({ id: props.order.id, payment: amount });
    activeData.value = await ordersService.getOrder(props.order.id);
    abonoAmount.value = "";
    abonoSuccess.value = true;
    setTimeout(() => {
      abonoSuccess.value = false;
    }, 3000);
  } catch (e: any) {
    abonoError.value = e?.message || "No se pudo registrar el abono.";
  } finally {
    abonoSaving.value = false;
  }
}

// ── Computed from detail (fallback to list data) ────────────────────────────
const activeDeliveryAddress = computed(
  () => activeData.value?.deliveryAddress ?? props.order?.deliveryAddress,
);
const activeCustomer = computed(
  () => activeData.value?.customer ?? props.order?.customer,
);
const activeCreatedBy = computed(
  () => activeData.value?.createdBy ?? props.order?.createdBy,
);
const activeUpdatedBy = computed(
  () => activeData.value?.updatedBy ?? props.order?.updatedBy,
);

const buildDeliveryAddress = computed(() => {
  const a = activeDeliveryAddress.value;
  if (!a) return "";
  return [
    a.street?.trim(),
    a.number ? `#${a.number}` : null,
    a.neighborhood?.trim(),
    a.city?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
});

const buildCustomerAddress = computed(() => {
  const a = activeCustomer.value?.address;
  if (!a) return "";
  return [
    a.street?.trim(),
    a.number ? `#${a.number}` : null,
    a.neighborhood?.trim(),
    a.city?.trim(),
  ]
    .filter(Boolean)
    .join(", ");
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function nameInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length >= 2)
    return ((parts[0]![0] ?? "") + (parts[1]![0] ?? "")).toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() ?? "??";
}

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mon = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${mon}/${d.getUTCFullYear()}`;
}

function formatDateTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  const date = `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
  const time = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
}

function typeColor(t?: OrderType) {
  return t
    ? (TYPE_COLORS[t] ?? { bg: "#eee", text: "#333" })
    : { bg: "#eee", text: "#333" };
}

function typeLabel(t?: OrderType) {
  return t ? (TYPE_LABELS[t] ?? t) : "—";
}

function paymentLabel(pm?: string | null) {
  return pm ? (PAYMENT_METHOD_LABELS[pm] ?? pm) : "—";
}

function roundLabel(r?: string | null) {
  return r ? (DELIVERY_ROUND_LABELS[r] ?? r) : "—";
}

// ── Descargar formato ───────────────────────────────────────────────────────
const downloading = ref(false);

function formatEndpoint(orderType?: OrderType): string {
  if (orderType === 'DOMICILIO') return 'domicilio';
  if (orderType === 'EVENTO')    return 'evento';
  if (orderType === 'VITRINA')   return 'vitrina';
  return 'personalizado'; // FLOR, PERSONALIZADO
}

async function downloadFormat() {
  if (downloading.value || !props.order) return;
  downloading.value = true;
  try {
    const config = useRuntimeConfig();
    const base = String(config.public.apiBase || '').replace(/\/$/, '');
    const token = useCookie<string | null>('access_token').value;
    const orderType = activeData.value?.orderType ?? props.order.orderType;
    const endpoint = formatEndpoint(orderType);
    const res = await fetch(`${base}/api/formats/${endpoint}/${props.order.id}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (e: any) {
    alert(e?.message || 'No se pudo generar el formato.');
  } finally {
    downloading.value = false;
  }
}
</script>
