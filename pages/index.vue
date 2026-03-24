<template>
  <!-- Hero -->
  <section class="relative overflow-hidden bg-gradient-to-br from-[#FFF0F7] via-[#FDE8F2] to-[#FAD6EA] py-24 px-5">
    <img src="/svg/flower-tl.svg" alt="" class="pointer-events-none absolute -top-10 -left-10 w-64 opacity-20" />
    <img src="/svg/flower-br.svg" alt="" class="pointer-events-none absolute -bottom-10 -right-10 w-64 opacity-20" />

    <div class="relative mx-auto max-w-3xl text-center">
      <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-[#101541] leading-tight">
        Dulces momentos,<br />
        <span class="text-[#F472B6]">hechos con amor</span>
      </h1>
      <p class="mt-5 text-base sm:text-lg text-[#101541]/60 max-w-xl mx-auto leading-relaxed">
        Pasteles, cupcakes y mucho más para tus celebraciones especiales.
        Elaborados de forma artesanal en cada una de nuestras sucursales.
      </p>
      <div class="mt-8 flex flex-wrap gap-3 justify-center">
        <NuxtLink
          to="/productos"
          class="rounded-xl bg-[#F472B6] px-6 py-3 text-sm font-semibold text-white hover:brightness-95 transition active:scale-[0.99] shadow-sm"
        >
          Ver productos
        </NuxtLink>
        <NuxtLink
          to="/sucursales"
          class="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#101541] ring-1 ring-black/10 hover:shadow transition active:scale-[0.99]"
        >
          Nuestras sucursales
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- Feature highlights -->
  <section class="py-16 px-5 bg-white">
    <div class="mx-auto max-w-6xl grid gap-8 sm:grid-cols-3 text-center">
      <div v-for="item in highlights" :key="item.title" class="rounded-2xl bg-[#FFF0F7] p-8">
        <div class="mb-4 grid h-12 w-12 mx-auto place-content-center rounded-xl bg-[#F472B6]/20 text-2xl">
          {{ item.icon }}
        </div>
        <h3 class="font-semibold text-[#101541]" >{{ item.title }}</h3>
        <p class="mt-1.5 text-sm text-[#101541]/60 leading-relaxed">{{ item.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useHead({ title: 'Inicio · Magnolias' })

const highlights = [
  { icon: '🎂', title: 'Pasteles artesanales', desc: 'Elaborados con ingredientes frescos y mucho cariño para cada ocasión.' },
  { icon: '📍', title: 'Varias sucursales',    desc: 'Encuéntranos en distintos puntos de la ciudad para servirte mejor.' },
  { icon: '🛍️', title: 'Pedidos personalizados', desc: 'Diseñamos junto a ti el pastel perfecto para tu celebración.' },
]
</script>
  