<template>
    <div class="p-10">
      <h1 class="text-3xl font-bold text-[#101541]">Landing</h1>
      <p class="mt-2 text-gray-600">Esto es público.</p>
  
      <div class="mt-6 flex gap-3">
        <NuxtLink to="/login" class="px-4 py-2 rounded-xl bg-[#101541] text-white font-semibold">
          Ir a Login
        </NuxtLink>
  
        <NuxtLink to="/admin" class="px-4 py-2 rounded-xl border font-semibold">
          Ir a Admin
        </NuxtLink>
      </div>
    </div>
  </template>
  