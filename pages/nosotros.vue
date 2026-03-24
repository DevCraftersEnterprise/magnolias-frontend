<template>
  <!-- Hero -->
  <section class="bg-gradient-to-br from-[#FFF0F7] via-[#FDE8F2] to-[#FAD6EA] py-16 px-5 text-center">
    <h1 class="text-3xl sm:text-4xl font-bold text-[#101541]">Nosotros</h1>
    <p class="mt-3 text-sm sm:text-base text-[#101541]/60 max-w-lg mx-auto">
      Conoce la historia y los valores que hacen a Magnolias especial.
    </p>
  </section>

  <!-- Contenido -->
  <section class="py-14 px-5">
    <div class="mx-auto max-w-4xl space-y-14">

      <!-- Historia -->
      <div class="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h2 class="text-2xl font-bold text-[#101541] mb-4">Nuestra historia</h2>
          <p class="text-[#101541]/70 leading-relaxed text-sm sm:text-base">
            Magnolias nació de la pasión por la repostería artesanal y el deseo de endulzar los momentos más
            especiales de las personas. Desde nuestros inicios, hemos apostado por ingredientes frescos
            y recetas propias que transmiten calidez en cada bocado.
          </p>
        </div>
        <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-[#F7C0DB] to-[#F48AC1] aspect-video flex items-center justify-center">
          <span class="text-6xl">🎂</span>
        </div>
      </div>

      <!-- Valores -->
      <div>
        <h2 class="text-2xl font-bold text-[#101541] mb-6 text-center">Nuestros valores</h2>
        <div class="grid gap-5 sm:grid-cols-3">
          <div v-for="v in values" :key="v.title" class="rounded-2xl bg-[#FFF0F7] p-6 text-center">
            <div class="text-3xl mb-3">{{ v.icon }}</div>
            <h3 class="font-semibold text-[#101541] mb-1">{{ v.title }}</h3>
            <p class="text-xs text-[#101541]/60 leading-relaxed">{{ v.desc }}</p>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useHead({ title: 'Nosotros · Magnolias' })

const values = [
  { icon: '💛', title: 'Calidad',      desc: 'Ingredientes frescos y seleccionados para garantizar el mejor sabor en cada producto.' },
  { icon: '🤝', title: 'Confianza',    desc: 'Construimos relaciones duraderas con nuestros clientes basadas en la honestidad.' },
  { icon: '✨', title: 'Creatividad',  desc: 'Diseñamos experiencias únicas adaptadas a cada celebración y gusto personal.' },
]
</script>
