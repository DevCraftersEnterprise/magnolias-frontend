<template>
    <header class="m-top">
      <button class="m-top__burger" type="button" @click="$emit('toggle')" aria-label="Menú">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
  
      <h1 class="m-top__title">{{ title }}</h1>
  
      <div class="m-top__user">
        <div class="m-top__avatar">{{ initials }}</div>

        <div class="m-top__meta">
            <div class="m-top__name">
                <span v-if="loading">Cargando…</span>
                <span v-else>{{ username }}</span>
            </div>
        <div class="m-top__role">{{ role }}</div>
        </div>
  
        <button class="m-top__logout" type="button" title="Cerrar sesión" @click="$emit('logout')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 7V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M16 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M7 9l-3 3 3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </header>
  </template>
  
  <script setup lang="ts">
  defineProps<{ title: string }>()
  defineEmits<{ (e: 'toggle'): void; (e: 'logout'): void }>()
  const { user, loading } = useAuthUser()

    const username = computed(() => user.value?.username ?? '...')
    const role = computed(() => user.value?.role ?? '')
    const initials = computed(() => {
    const u = user.value?.username?.trim()
    if (!u) return '??'
    return u.slice(0, 2).toUpperCase()
    })
  </script>
  
  <style scoped>
  .m-top{
  height: 86px;
  background: #fff;
  display: grid;
  grid-template-columns: auto 1fr auto; /* ✅ burger | title | user */
  align-items: center;
  gap: 16px;
  padding: 0 26px;
  border-bottom: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 8px 22px rgba(0,0,0,.06);
  position: sticky;
  top: 0;
  z-index: 20;
}

  
  /* burger igual */
.m-top__burger{
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,.08);
  background: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: #111;
  transition: background .15s ease, transform .15s ease;
}
.m-top__burger:hover{
  background: #f4f4f4;
  transform: translateY(-1px);
}
  
  .m-top__title{
  font-size: 28px;     /* antes 34 */
  font-weight: 600;
  margin: 0;
  color: #111;
  justify-self: start;
}
  
  /* user como ya lo tienes bien */
.m-top__user{
  display: flex;
  align-items: center;
  gap: 12px;
  justify-self: end;
  background: transparent !important;
}

/* mobile */
@media (max-width: 900px){
  .m-top{ height: 74px; padding: 0 16px; }
  .m-top__title{ font-size: 22px; }  /* más compacto */
}
  
  .m-top__avatar{
    width: 46px;
    height: 46px;
    border-radius: 999px;
    background: #f3b7d1;
    display: grid;
    place-items: center;
    color: #1a1a1a;
    font-weight: 700;
    box-shadow: 0 6px 14px rgba(0,0,0,.08);
    flex: 0 0 auto;
  }
  
  .m-top__meta{
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }
  
  .m-top__name{
    font-weight: 700;
    font-size: 14px;
    color: #1a1a1a;
  }
  .m-top__role{
    font-size: 12px;
    color: #7a7a7a;
    margin-top: 2px;
  }
  
  .m-top__logout{
    width: 42px;
    height: 42px;
    border-radius: 999px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: grid;
    place-items: center;
    color: #1a1a1a;
    transition: background .15s ease, transform .15s ease;
    flex: 0 0 auto;
  }
  .m-top__logout:hover{
    background: #fbeaf2;
    transform: translateY(-1px);
  }
  
  @media (max-width: 900px){
    .m-top{ height: 74px; padding: 0 16px; }
    .m-top__title{ font-size: 24px; }
    .m-top__avatar{ width: 40px; height: 40px; }
  }
  </style>