<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- ===== NAVBAR (fixed, overlays content transparently at top) ===== -->
    <header
      class="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      :class="
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      "
    >
      <div
        class="mx-auto max-w-6xl px-5 h-16 grid items-center"
        style="grid-template-columns: 1fr auto 1fr"
      >
        <!-- Left: nav links (desktop) / hamburger (mobile) -->
        <div class="flex items-center">
          <nav class="hidden md:flex items-center gap-6">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="text-sm text-[#1E1E1E]/60 hover:text-[#1E1E1E] transition tracking-wide"
              active-class="text-[#1E1E1E] font-semibold"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
          <button
            class="md:hidden grid h-9 w-9 place-content-center rounded-xl hover:bg-black/5 transition"
            @click="mobileOpen = !mobileOpen"
          >
            <svg class="h-5 w-5 text-[#1E1E1E]" viewBox="0 0 24 24" fill="none">
              <path
                v-if="!mobileOpen"
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <path
                v-else
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <!-- Center: logo -->
        <NuxtLink to="/" class="flex justify-center">
          <img
            src="/img/magnolias-logo.png"
            alt="Magnolias"
            class="h-10 w-auto"
          />
        </NuxtLink>

          <!-- Right: social icons -->
          <div class="flex items-center justify-end gap-3">
            <a href="#" target="_blank" rel="noopener noreferrer"
               class="text-[#1E1E1E]/50 hover:text-[#1E1E1E] transition">
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer"
               class="text-[#1E1E1E]/50 hover:text-[#1E1E1E] transition">
              <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>
        </div>

      <!-- Mobile menu -->
      <Transition name="slide">
        <div
          v-if="mobileOpen"
          class="md:hidden border-t border-black/5 bg-white px-5 py-3 space-y-1"
        >
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#1E1E1E]/70 hover:text-[#1E1E1E] hover:bg-black/5 transition"
            active-class="bg-black/5 text-[#1E1E1E] font-semibold"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </Transition>
    </header>

    <!-- Page content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="bg-[#1E1E1E] text-white">
      <div
        class="mx-auto max-w-2xl px-5 py-12 flex flex-col items-center gap-5"
      >
        <img
          src="/img/magnolias-logo.png"
          alt="Magnolias"
          class="h-12 w-auto brightness-0 invert"
        />

        <div class="flex items-center gap-5">
          <a href="#" target="_blank" rel="noopener noreferrer" class="text-white/50 hover:text-white transition">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
              />
            </svg>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" class="text-white/50 hover:text-white transition">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>

        <!-- <NuxtLink to="/terminos" class="text-xs text-white/40 underline underline-offset-4 hover:text-white/70 transition">
          Términos y condiciones
        </NuxtLink> -->

        <p class="text-xs text-white/25 text-center">
          © {{ new Date().getFullYear() }} Pastelería Magnolias &nbsp;|&nbsp;
          Todos los derechos reservados
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const mobileOpen = ref(false);
const scrolled = ref(false);

onMounted(() => {
  const onScroll = () => {
    scrolled.value = window.scrollY > 20;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onUnmounted(() => window.removeEventListener("scroll", onScroll));
});

const navLinks = [
  { to: "/productos", label: "Productos" },
  { to: "/sucursales", label: "Sucursales" },
  // { to: '/nosotros',   label: 'Acerca de' },
];
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
