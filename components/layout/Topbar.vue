<template>
    <header class="m-top">
      <button class="m-top__burger" type="button" @click="$emit('toggle')" aria-label="Menú">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M4 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
  
      <div class="m-top__center">
        <h1 class="m-top__title">{{ title }}</h1>

        <div v-if="!canSeeBranchSelect && selectedBranch" class="m-top__branch-readonly">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="m-top__branch-readonly-icon">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span class="m-top__branch-readonly-label">{{ selectedBranch?.name }}</span>
        </div>

        <div v-if="canSeeBranchSelect && branches.length > 0" class="m-top__branch-wrapper">
          <svg class="m-top__branch-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <select
            class="m-top__branch-select"
            :value="selectedBranch?.id ?? ''"
            @change="e => { const v = (e.target as HTMLSelectElement).value; selectedBranch = v ? (branches.find(b => b.id === v) ?? null) : null }">
            <option value="">Todas las sucursales</option>
            <option v-for="b in branches" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
          <svg class="m-top__branch-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
  
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
  const { branches, selectedBranch } = useBranch()

    const username = computed(() => user.value?.username ?? '...')
    const role = computed(() => user.value?.role ?? '')
    const canSeeBranchSelect = computed(() => ['ADMIN', 'SUPER'].includes(user.value?.role ?? ''))

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
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 0 26px;
  border-bottom: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 8px 22px rgba(0,0,0,.06);
  position: sticky;
  top: 0;
  z-index: 20;
}

.m-top__center {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-self: start;
  min-width: 0;
}

.m-top__branch-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.m-top__branch-icon {
  position: absolute;
  left: 10px;
  width: 15px;
  height: 15px;
  color: #f472b6;
  pointer-events: none;
  z-index: 1;
}

.m-top__branch-select {
  appearance: none;
  background: #fff;
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 12px;
  padding: 7px 34px 7px 32px;
  font-size: 14px;
  font-weight: 600;
  color: #101541;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  outline: none;
  transition: border-color .15s, box-shadow .15s;
  max-width: 200px;
}

.m-top__branch-select:focus {
  border-color: #f472b6;
  box-shadow: 0 0 0 3px rgba(244,114,182,.15);
}

.m-top__branch-arrow {
  position: absolute;
  right: 9px;
  width: 14px;
  height: 14px;
  color: #9ca3af;
  pointer-events: none;
}

.m-top__branch-readonly {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fdf2f8;
  border: 1px solid #fbcfe8;
  border-radius: 12px;
  padding: 6px 12px 6px 10px;
}

.m-top__branch-readonly-icon {
  width: 14px;
  height: 14px;
  color: #f472b6;
  flex-shrink: 0;
}

.m-top__branch-readonly-label {
  font-size: 13px;
  font-weight: 600;
  color: #101541;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
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
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #111;
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
  .m-top__title{ font-size: 22px; }
  .m-top__branch-select{ max-width: 140px; font-size: 13px; }
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