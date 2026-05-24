<script setup lang="ts">
defineEmits<{
  scrollToStart: [];
  openSearch: [];
}>();

const stats = [
  { icon: "📚", value: "10", label: "Secciones" },
  { icon: "👥", value: "5", label: "Roles" },
  { icon: "🛒", value: "4", label: "Tipos de pedido" },
  { icon: "📋", value: "7", label: "Catálogos" },
];
</script>

<template>
  <section
    class="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50 border-b border-pink-100"
  >
    <!-- Decorative circles -->
    <div
      class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-pink-100/40 blur-3xl pointer-events-none"
    />
    <div
      class="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-purple-100/30 blur-2xl pointer-events-none"
    />

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <!-- Left: Text content -->
        <div class="space-y-5">
          <!-- Badge -->
          <div
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 border border-pink-200"
          >
            <span class="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
            <span
              class="text-xs font-semibold text-pink-700 tracking-wider uppercase"
            >
              Centro de capacitación
            </span>
          </div>

          <!-- Title -->
          <div>
            <h1
              class="text-4xl sm:text-5xl font-black text-gray-900 leading-tight tracking-tight"
            >
              Manual de
              <span
                class="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500"
              >
                Usuario
              </span>
            </h1>
            <p class="mt-1 text-lg font-medium text-gray-500 tracking-tight">
              Panel de Administración · Pastelería Magnolias
            </p>
          </div>

          <!-- Description -->
          <p class="text-base text-gray-600 leading-relaxed max-w-md">
            Guía completa para administradores y empleados. Aprende a gestionar
            pedidos, productos, clientes y más de forma clara y paso a paso.
          </p>

          <!-- Quick stats -->
          <div class="flex flex-wrap gap-4 pt-2">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-100 shadow-sm"
            >
              <span class="text-xl">{{ stat.icon }}</span>
              <div>
                <p class="text-sm font-bold text-gray-900">{{ stat.value }}</p>
                <p class="text-xs text-gray-500">{{ stat.label }}</p>
              </div>
            </div>
          </div>

          <!-- CTA buttons -->
          <div class="flex flex-wrap gap-3 pt-1">
            <button
              @click="$emit('scrollToStart')"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>🚀</span>
              Comenzar
            </button>
            <button
              @click="$emit('openSearch')"
              class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-pink-300 text-gray-700 font-semibold text-sm transition-all duration-200 hover:shadow-md"
            >
              <span>🔍</span>
              Buscar en el manual
            </button>
          </div>
        </div>

        <!-- Right: Three.js scene -->
        <div class="relative">
          <ClientOnly>
            <ManualThreeScene />
            <template #fallback>
              <div
                class="w-full h-80 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center"
              >
                <span class="text-6xl">🎂</span>
              </div>
            </template>
          </ClientOnly>

          <!-- Floating labels -->
          <div
            class="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-pink-100 shadow-sm"
          >
            <p class="text-xs font-semibold text-pink-600">
              Pastelería Magnolias
            </p>
            <p class="text-xs text-gray-500">Est. 1999</p>
          </div>
          <div
            class="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-purple-100 shadow-sm"
          >
            <p class="text-xs font-semibold text-purple-600">DevCrafters.dev</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
