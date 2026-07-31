<script setup lang="ts">
defineProps<{ collapsed?: boolean }>();
defineEmits<{ (e: "navigate"): void }>();

const { user } = useAuthUser();
const { effectiveRole } = useViewAs();

const itemsBase = [
  {
    label: "Productos",
    to: "/admin/productos",
    key: "productos",
    adminOnly: true,
  },
  { label: "Pedidos", to: "/admin/pedidos", key: "pedidos" },
  {
    label: "Sucursales",
    to: "/admin/sucursales",
    key: "sucursales",
    adminOnly: true,
  },
  {
    label: "Catálogos",
    to: "/admin/catalogos",
    key: "catalogos",
    adminOnly: true,
  },
  { label: "Clientes", to: "/admin/clientes", key: "clientes" },
  {
    label: "Usuarios",
    to: "/admin/usuarios",
    key: "usuarios",
    adminOnly: true,
  },
  {
    label: "Empleados",
    to: "/admin/empleados",
    key: "empleados",
    adminOnly: true,
  },
];

const items = computed(() => {
  const role = effectiveRole.value;
  if (!role) return [];

  switch (role) {
    case "BAKER":
      return itemsBase.filter((i) => i.key === "pedidos");
    default:
      return itemsBase.filter(
        (i) => !i.adminOnly || role === "ADMIN" || role === "SUPER",
      );
  }
});
</script>

<template>
  <div class="sticky top-0 h-screen py-[18px] px-3 overflow-y-auto">
    <div class="grid place-items-center pt-[14px] pb-[26px]">
      <NuxtLink :to="effectiveRole === 'BAKER' ? '/admin/pedidos' : '/admin'">
        <img
          src="/img/magnolias-logo.png"
          alt="Magnolias"
          class="h-11 w-[140px] object-contain opacity-[0.95]"
        />
      </NuxtLink>
    </div>

    <nav class="flex flex-col gap-[14px] pt-[6px]">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex items-center py-[14px] rounded-xl no-underline text-[#222] text-base transition-colors duration-150 hover:bg-[#fbeaf2]"
        :class="collapsed ? 'justify-center px-[10px]' : 'px-3'"
        active-class="bg-[#f6dbe8]"
        @click="$emit('navigate')"
      >
        <span
          class="overflow-hidden whitespace-nowrap transition-all duration-150"
          :class="collapsed ? 'w-0 opacity-0' : ''"
        >
          {{ item.label }}
        </span>
      </NuxtLink>
    </nav>
  </div>
</template>
