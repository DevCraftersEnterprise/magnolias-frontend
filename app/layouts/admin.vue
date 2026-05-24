<script setup lang="ts">
const { loadUserFromToken, clearUser } = useAuthUser();
const { loadBranches } = useBranch();

const drawerOpen = ref(false);
const collapsed = ref(false);
const isMobile = ref(false);

const route = useRoute();

const pageTitle = computed(() => (route.meta.pageTitle as string) ?? "Admin");

function computeIsMobile() {
  if (typeof window === "undefined") return;
  isMobile.value = window.matchMedia("(max-width: 900px)").matches;
  if (isMobile.value) collapsed.value = false; // en móvil NO colapsamos, usamos drawer
  if (!isMobile.value) drawerOpen.value = false;
}

onMounted(async () => {
  await loadUserFromToken();
  await loadBranches();
  computeIsMobile();
  window.addEventListener("resize", computeIsMobile);
});
onBeforeUnmount(() => {
  if (typeof window !== "undefined")
    window.removeEventListener("resize", computeIsMobile);
});

function handleToggle() {
  if (isMobile.value) drawerOpen.value = !drawerOpen.value;
  else collapsed.value = !collapsed.value;
}

async function logout() {
  useCookie("access_token").value = null;
  useCookie("refresh_token").value = null;
  clearUser();
  await navigateTo("/login");
}
</script>

<template>
  <div
    class="min-h-screen bg-[#f4f4f4] grid transition-[grid-template-columns] duration-[180ms] ease-in-out max-[900px]:grid-cols-1"
    :class="collapsed ? 'grid-cols-[0px_1fr]' : 'grid-cols-[220px_1fr]'"
  >
    <div
      v-if="drawerOpen"
      class="fixed inset-0 bg-black/20 z-40"
      @click="drawerOpen = false"
    />

    <aside
      class="bg-white border-r border-black/[0.06] overflow-x-hidden h-screen sticky top-0 z-10 transition-[width,box-shadow] duration-[180ms] ease-in-out max-[900px]:fixed max-[900px]:left-0 max-[900px]:top-0 max-[900px]:bottom-0 max-[900px]:w-[280px] max-[900px]:z-50 max-[900px]:overflow-y-auto max-[900px]:shadow-[0_10px_30px_rgba(0,0,0,0.1)] max-[900px]:transition-transform max-[900px]:duration-[220ms] max-[900px]:ease-in-out"
      :class="
        isMobile
          ? drawerOpen
            ? 'translate-x-0'
            : '-translate-x-[110%]'
          : collapsed
            ? 'w-0 min-w-0 border-r-0 shadow-none overflow-hidden'
            : 'w-[220px] overflow-y-auto shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
      "
    >
      <LayoutSidebar @navigate="drawerOpen = false" />
    </aside>

    <div class="min-w-0 flex flex-col">
      <LayoutTopbar
        :title="pageTitle"
        @toggle="handleToggle"
        @logout="logout"
      />

      <main class="py-[22px] px-6 max-[900px]:py-[18px] max-[900px]:px-4">
        <div class="w-full max-w-[1400px] mx-auto">
          <slot />
        </div>
      </main>
    </div>
  </div>

  <div class="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
    <UiFloatingDownloadButton />
  </div>
</template>
