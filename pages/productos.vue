<template>
  <!-- Hero compacto -->
  <section class="bg-gradient-to-br from-[#FFF0F7] via-[#FDE8F2] to-[#FAD6EA] py-16 px-5 text-center">
    <h1 class="text-3xl sm:text-4xl font-bold text-[#101541]">Nuestros Productos</h1>
    <p class="mt-3 text-sm sm:text-base text-[#101541]/60 max-w-lg mx-auto">
      Descubre toda nuestra variedad de pasteles, cupcakes y delicias artesanales.
    </p>
  </section>

  <!-- Contenido principal -->
  <section class="py-14 px-5">
    <div class="mx-auto max-w-6xl">
      <!-- Placeholder: aquí irá el catálogo público de productos -->
      <div class="rounded-2xl bg-[#FFF0F7] border border-[#F472B6]/20 p-12 text-center">
        <div class="text-5xl mb-4">🎂</div>
        <p class="text-[#101541]/50 text-sm">El catálogo de productos estará disponible próximamente.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useHead({ title: 'Productos · Magnolias' })
</script>
