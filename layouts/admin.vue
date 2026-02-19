<template>
    <div class="min-h-screen bg-gray-50">
      <header class="h-14 bg-white border-b flex items-center px-4">
        <div class="font-bold">Magnolias Admin</div>
        <div class="ml-auto">
          <button class="text-sm font-semibold" @click="logout">Salir</button>
        </div>
      </header>
  
      <main class="p-6">
        <slot />
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  const access = useCookie<string | null>('access_token')
  const refresh = useCookie<string | null>('refresh_token')
  const user = useState<any | null>('auth_user', () => null)
  
  const logout = async () => {
    access.value = null
    refresh.value = null
    user.value = null
    await navigateTo('/login')
  }
  </script>
  