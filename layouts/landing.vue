<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Navbar -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm ring-1 ring-black/5">
      <div class="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between gap-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <img src="/img/magnolias-logo.png" alt="Magnolias" class="h-9 w-auto" />
        </NuxtLink>

        <!-- Nav links (desktop) -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-xl px-3.5 py-2 text-sm font-medium text-[#101541]/70 hover:text-[#101541] hover:bg-black/5 transition"
            active-class="bg-black/5 text-[#101541] font-semibold"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- CTA -->
        <div class="flex items-center gap-2">
          <NuxtLink
            to="/login"
            class="hidden sm:inline-flex items-center rounded-xl bg-[#F472B6] px-4 py-2 text-sm font-semibold text-white hover:brightness-95 transition active:scale-[0.99]"
          >
            Administración
          </NuxtLink>

          <!-- Mobile hamburger -->
          <button
            class="md:hidden grid h-9 w-9 place-content-center rounded-xl hover:bg-black/5 transition"
            @click="mobileOpen = !mobileOpen"
          >
            <svg class="h-5 w-5 text-[#101541]" viewBox="0 0 24 24" fill="none">
              <path v-if="!mobileOpen" d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path v-else d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition name="slide">
        <div v-if="mobileOpen" class="md:hidden border-t border-black/5 bg-white px-5 py-3 space-y-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#101541]/70 hover:text-[#101541] hover:bg-black/5 transition"
            active-class="bg-black/5 text-[#101541] font-semibold"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="block rounded-xl bg-[#F472B6] px-3.5 py-2.5 text-sm font-semibold text-white text-center mt-2 hover:brightness-95 transition"
            @click="mobileOpen = false"
          >
            Administración
          </NuxtLink>
        </div>
      </Transition>
    </header>

    <!-- Page content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-[#101541] text-white">
      <div class="mx-auto max-w-6xl px-5 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
        <!-- Brand -->
        <div>
          <img src="/img/magnolias-logo.png" alt="Magnolias" class="h-9 w-auto brightness-0 invert mb-3" />
          <p class="text-sm text-white/60 leading-relaxed">
            Pastelería artesanal hecha con amor, para los momentos más dulces.
          </p>
        </div>

        <!-- Links -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Navegación</p>
          <ul class="space-y-2">
            <li v-for="link in navLinks" :key="link.to">
              <NuxtLink :to="link.to" class="text-sm text-white/70 hover:text-white transition">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Social / contact placeholder -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Contáctanos</p>
          <NuxtLink to="/contacto" class="text-sm text-white/70 hover:text-white transition block">
            Formulario de contacto
          </NuxtLink>
        </div>
      </div>

      <div class="border-t border-white/10 text-center px-5 py-4 text-xs text-white/30">
        © {{ new Date().getFullYear() }} Magnolias. Todos los derechos reservados.
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const mobileOpen = ref(false)

const navLinks = [
  { to: '/',            label: 'Inicio' },
  { to: '/productos',   label: 'Productos' },
  { to: '/sucursales',  label: 'Sucursales' },
  { to: '/nosotros',    label: 'Nosotros' },
  { to: '/contacto',    label: 'Contacto' },
]
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
