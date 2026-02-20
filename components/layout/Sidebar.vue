<template>
    <div class="m-side">
      <div class="m-side__brand">
        <img src="/img/magnolias-logo.png" alt="Magnolias" class="m-side__logo" />
      </div>
  
      <nav class="m-side__nav" :class="{ 'is-collapsed': collapsed }">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="m-side__item"
          active-class="is-active"
          @click="$emit('navigate')"
        >
          <span class="m-side__label">{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{ collapsed?: boolean }>()
  defineEmits<{ (e: 'navigate'): void }>()
  
  const items = [
    { label: 'Productos', to: '/admin/productos' },
    { label: 'Pedidos', to: '/admin/pedidos' },
    { label: 'Sucursales', to: '/admin/sucursales' },
    { label: 'Catálogos', to: '/admin/catalogos' },
    { label: 'Clientes', to: '/admin/clientes' },
  ]
  </script>
  
  <style scoped>
  .m-side{
    height: 100%;
    padding: 18px 12px;
  }
  
  .m-side__brand{
  display: grid;
  place-items: center;
  padding: 14px 0 26px;
}

.m-side__logo{
  height: 44px;
  width: 140px;        /* ✅ fija un ancho razonable */
  object-fit: contain;
  opacity: .95;
}
  
  .m-side__nav{
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding-top: 6px;
  }
  
  .m-side__item{
    display: flex;
    align-items: center;
    padding: 14px 12px;
    border-radius: 12px;
    text-decoration: none;
    color: #222;
    font-size: 16px;
    transition: background .15s ease;
  }
  
  .m-side__item:hover{
    background: #fbeaf2;
  }
  
  .m-side__item.is-active{
    background: #f6dbe8;
  }
  
  .m-side__nav.is-collapsed .m-side__item{
    justify-content: center;
    padding: 14px 10px;
  }
  
  .m-side__nav.is-collapsed .m-side__label{
    width: 0;
    opacity: 0;
    overflow: hidden;
    white-space: nowrap;
  }
  </style>