<template>
    <div class="p-6">
      <h1 class="text-2xl font-bold text-[#101541]">Admin Dashboard</h1>
      <p class="text-gray-600 mt-1">Si ves esto, la ruta /admin ya está viva ✅</p>
  
      <div class="mt-4">
        <NuxtLink to="/login" class="underline text-blue-600">Ir a login</NuxtLink>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  definePageMeta({ layout: 'admin', middleware: ['auth'] })
  </script>
  