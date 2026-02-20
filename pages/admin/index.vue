<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const quick = [
  { label: 'Productos', to: '/admin/productos' },
  { label: 'Pedidos', to: '/admin/pedidos' },
  { label: 'Sucursales', to: '/admin/sucursales' },
  { label: 'Catálogos', to: '/admin/catalogos' },
  { label: 'Clientes', to: '/admin/clientes' },
]

// Opcional: cosas recientes (dummy por ahora)
const recent = [
  { label: 'Editar: Pastel “Red Velvet”', meta: 'Productos' },
  { label: 'Pedido #1042 actualizado', meta: 'Pedidos' },
  { label: 'Nuevo color agregado', meta: 'Catálogos' },
]
</script>

<template>
  <section class="space-y-5">
    <!-- Título minimal (no "bienvenida", no rol) -->
    <div class="flex items-end justify-between gap-4">
      <div>
        <h2 class="text-[20px] font-extrabold tracking-tight text-zinc-900">
          Panel
        </h2>
        <p class="mt-1 text-[13px] text-zinc-500">
          Elige una sección para administrar.
        </p>
      </div>
    </div>

    <!-- Layout tipo Figma: contenedores blancos con lista -->
    <div class="grid gap-5 lg:grid-cols-2">
      <!-- Accesos -->
      <div class="rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-black/5 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-black/10">
          <div class="text-[14px] font-extrabold text-zinc-900">Accesos rápidos</div>
          <div class="text-[12px] font-semibold text-zinc-400">Admin</div>
        </div>

        <div class="p-2">
          <NuxtLink
            v-for="q in quick"
            :key="q.to"
            :to="q.to"
            class="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5
                   text-[14px] text-zinc-800 transition hover:bg-pink-50"
          >
            <span class="font-medium">{{ q.label }}</span>

            <span class="inline-flex items-center gap-2 text-zinc-400 group-hover:text-zinc-700">
              <span class="text-[12px] font-semibold">Abrir</span>
              <span class="text-[16px] leading-none">→</span>
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Recientes -->
      <div class="rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-black/5 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-black/10">
          <div class="text-[14px] font-extrabold text-zinc-900">Recientes</div>
          <div class="text-[12px] font-semibold text-zinc-400">Últimos cambios</div>
        </div>

        <div class="p-2">
          <div
            v-for="(r, i) in recent"
            :key="i"
            class="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5
                   text-[14px] text-zinc-800 hover:bg-pink-50 transition"
          >
            <div class="min-w-0">
              <div class="truncate font-medium">{{ r.label }}</div>
              <div class="mt-0.5 text-[12px] text-zinc-500">{{ r.meta }}</div>
            </div>
            <div class="text-zinc-400 font-extrabold">…</div>
          </div>

          <!-- si no quieres “recientes”, borra toda esta caja y listo -->
        </div>
      </div>
    </div>
  </section>
</template>