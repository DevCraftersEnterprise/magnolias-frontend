<script setup lang="ts">
const activeStep = ref(0);

const steps = [
  {
    id: "sucursal",
    icon: "🏪",
    iconBg: "bg-pink-100",
    badgeClass: "bg-pink-500 text-white",
    title: "Crear una sucursal",
    description:
      "Registra al menos un punto físico de venta o producción antes de hacer cualquier otra cosa.",
    items: [
      'Ve a la sección "Sucursales" en el menú lateral',
      'Haz clic en "+ Agregar sucursal"',
      "Ingresa nombre y dirección completa (Paso 1)",
      "Agrega teléfono principal y opcionalmente secundario y WhatsApp (Paso 2)",
      'Haz clic en "Guardar"',
    ],
  },
  {
    id: "catalogos",
    icon: "📋",
    iconBg: "bg-purple-100",
    badgeClass: "bg-purple-500 text-white",
    title: "Llenar los catálogos",
    description:
      "Carga las opciones de personalización para que los empleados puedan crear pedidos completos.",
    items: [
      'Ve a la sección "Catálogos" en el menú lateral',
      "Agrega opciones en: Tipo de pan, Rellenos, Sabores",
      "Agrega opciones en: Cubiertas, Estilos, Flores",
      "Agrega colores con su nombre y código hexadecimal",
      "Cuantas más opciones cargues, más completos serán los pedidos",
    ],
  },
  {
    id: "usuarios",
    icon: "👤",
    iconBg: "bg-rose-100",
    badgeClass: "bg-rose-500 text-white",
    title: "Crear usuarios",
    description:
      "Crea las cuentas de acceso para cada colaborador con su rol y sucursal asignados.",
    items: [
      'Ve a la sección "Usuarios" en el menú lateral',
      'Haz clic en "+" para agregar un usuario',
      "Llena nombre, apellido, usuario, contraseña y rol",
      "Para empleados/asistentes: asigna una sucursal",
      "Para pasteleros: puedes asignar varias sucursales",
    ],
  },
];
</script>

<template>
  <div class="relative">
    <!-- Connecting line (desktop) -->
    <div
      class="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200"
      style="top: 2rem; z-index: 0"
    />

    <div class="relative grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="(step, index) in steps" :key="step.id" class="relative group">
        <!-- Card -->
        <div
          class="relative bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1"
          :class="[
            activeStep === index
              ? 'border-pink-400 shadow-lg shadow-pink-100'
              : 'border-gray-100 hover:border-pink-200',
          ]"
          @click="activeStep = index"
        >
          <!-- Step number badge -->
          <div
            class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md z-10"
            :class="step.badgeClass"
          >
            {{ index + 1 }}
          </div>

          <div class="pt-6 pb-5 px-5 text-center">
            <!-- Icon -->
            <div
              class="mx-auto mb-3 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              :class="step.iconBg"
            >
              {{ step.icon }}
            </div>

            <!-- Title -->
            <h3 class="text-sm font-bold text-gray-900 mb-1">
              {{ step.title }}
            </h3>
            <p class="text-xs text-gray-500 leading-relaxed">
              {{ step.description }}
            </p>

            <!-- Expand indicator -->
            <div
              class="mt-3 text-xs font-medium transition-colors"
              :class="activeStep === index ? 'text-pink-500' : 'text-gray-400'"
            >
              {{ activeStep === index ? "▲ Menos detalle" : "▼ Ver detalle" }}
            </div>
          </div>

          <!-- Expanded detail -->
          <Transition name="expand">
            <div
              v-if="activeStep === index"
              class="border-t border-gray-100 px-5 pb-5 pt-4 bg-pink-50/40 rounded-b-2xl"
            >
              <ul class="space-y-1.5">
                <li
                  v-for="item in step.items"
                  :key="item"
                  class="flex items-start gap-2 text-xs text-gray-700"
                >
                  <span class="mt-0.5 text-pink-500 flex-shrink-0">✓</span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </Transition>
        </div>

        <!-- Arrow between cards (mobile) -->
        <div
          v-if="index < steps.length - 1"
          class="flex md:hidden justify-center my-2"
        >
          <span class="text-pink-300 text-xl">↓</span>
        </div>
      </div>
    </div>

    <!-- Recommendation box -->
    <div
      class="mt-8 p-5 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100"
    >
      <div class="flex items-start gap-3">
        <div
          class="flex-shrink-0 w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-lg"
        >
          💡
        </div>
        <div>
          <p class="text-sm font-bold text-gray-900 mb-0.5">
            Recomendación importante
          </p>
          <p class="text-sm text-gray-600 leading-relaxed">
            Antes de capacitar a los empleados, el administrador debe asegurarse
            de que
            <strong class="text-pink-700"
              >exista al menos una sucursal activa</strong
            >, que
            <strong class="text-purple-700"
              >los catálogos principales estén cargados</strong
            >
            y que
            <strong class="text-gray-800"
              >cada usuario tenga su rol y sucursal asignados</strong
            >.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 400px;
}
</style>
