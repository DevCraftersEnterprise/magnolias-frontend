<template>
  <div class="m-admin" :class="{ 'is-collapsed': collapsed }">
    <div
      v-if="drawerOpen"
      class="m-admin__overlay"
      @click="drawerOpen = false"
    ></div>

    <aside class="m-admin__sidebar" :class="{ 'is-drawer-open': drawerOpen }">
      <Sidebar @navigate="drawerOpen = false" />
    </aside>

    <div class="m-admin__main">
      <Topbar :title="pageTitle" @toggle="handleToggle" @logout="logout" />

      <main class="m-admin__content">
        <div class="m-admin__container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "~/components/layout/Sidebar.vue";
import Topbar from "~/components/layout/Topbar.vue";

const { loadUserFromToken, clearUser } = useAuthUser();
const { loadBranches } = useBranch();

onMounted(async () => {
  await loadUserFromToken();
  await loadBranches();
});

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

onMounted(() => {
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

<style scoped>
.m-admin {
  min-height: 100vh;
  background: #f4f4f4;
  display: grid;
  grid-template-columns: 220px 1fr;
  transition: grid-template-columns 0.18s ease;
}

.m-admin.is-collapsed {
  grid-template-columns: 0px 1fr;
}

/* sidebar desktop fijo */
.m-admin__sidebar {
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 10;
  width: 220px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* colapsado */
.m-admin.is-collapsed .m-admin__sidebar {
  width: 0;
  min-width: 0;
  border-right: 0;
  box-shadow: none;
  overflow: hidden;
}

.m-admin__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.m-admin__content {
  padding: 22px 24px;
}

.m-admin__container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.m-admin__overlay {
  display: none;
}

/* ===== Mobile drawer ===== */
@media (max-width: 900px) {
  .m-admin {
    grid-template-columns: 1fr;
  }

  .m-admin__sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100vh;
    transform: translateX(-110%);
    transition: transform 0.22s ease;
    z-index: 50;
    width: 280px;
    border-right: 1px solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    overflow-x: hidden;
  }

  .m-admin__sidebar.is-drawer-open {
    transform: translateX(0);
  }

  .m-admin__overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 40;
  }

  .m-admin__content {
    padding: 18px 16px;
  }
}
</style>
