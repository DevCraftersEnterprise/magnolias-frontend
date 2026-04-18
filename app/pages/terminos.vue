<template>
  <!-- ===== HERO ===== -->
  <section
    class="relative overflow-hidden pt-28 pb-16 px-5 text-center"
    style="background: radial-gradient(ellipse at 65% 0%, #fce8f0 0%, #f9d5e6 45%, #f2b3d0 100%)"
  >
    <img src="/svg/flower-tl.svg" alt="" class="pointer-events-none absolute top-0 left-0 w-48 opacity-20" />
    <img src="/svg/flower-tl.svg" alt="" class="pointer-events-none absolute top-0 right-0 w-48 opacity-20 scale-x-[-1]" />
    <h1 class="relative font-serif text-4xl sm:text-5xl text-[#1E1E1E]">Términos y Condiciones</h1>
    
  </section>

  <!-- ===== CONTENIDO ===== -->
  <div>
    <section
      v-for="(section, index) in sections"
      :key="section.id"
      :class="index % 2 === 0 ? 'bg-white' : 'bg-[#FDE8F2]'"
    >
      <div class="mx-auto max-w-3xl px-6 py-10">
        <!-- Número + título -->
        <div class="flex items-start gap-4">
          <span
            class="flex-shrink-0 mt-1 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style="background: linear-gradient(135deg, #F48AC1, #f472b6)"
          >
            {{ index + 1 }}
          </span>
          <div class="flex-1 min-w-0">
            <h2 class="font-serif text-xl sm:text-2xl text-[#1E1E1E] leading-snug mb-3">
              {{ section.title }}
            </h2>
            <div class="space-y-2.5">
              <p
                v-for="(paragraph, pi) in section.paragraphs"
                :key="pi"
                class="text-[#1E1E1E]/65 text-sm leading-relaxed"
              >
                {{ paragraph }}
              </p>
              <!-- Lista opcional -->
              <ul
                v-if="section.items"
                class="mt-2 space-y-1.5 pl-1"
              >
                <li
                  v-for="(item, li) in section.items"
                  :key="li"
                  class="flex items-start gap-2 text-sm text-[#1E1E1E]/65"
                >
                  <span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#F48AC1] flex-shrink-0"></span>
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- ===== AVISO FINAL ===== 
  <section class="bg-[#1E1E1E] py-12 px-5 text-center">
    <p class="text-white/60 text-sm max-w-xl mx-auto leading-relaxed">
      Si tienes dudas sobre estos términos, no dudes en
      <NuxtLink to="/contacto" class="text-[#F48AC1] hover:text-[#f472b6] underline underline-offset-2 transition">
        contactarnos
      </NuxtLink>.
      Estamos aquí para ayudarte.
    </p>
  </section>-->
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useHead({ title: 'Términos y Condiciones · Magnolias' })

const lastUpdated = new Date().toLocaleDateString('es-MX', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const sections = [
  {
    id: 'aceptacion',
    title: 'Aceptación de los Términos',
    paragraphs: [
      'Al acceder y utilizar el sitio web de Pastelería Magnolias, aceptas quedar sujeto a los presentes Términos y Condiciones, así como a nuestra Política de Privacidad.',
      'Si no estás de acuerdo con alguna parte de estos términos, te pedimos que no hagas uso de nuestro sitio ni de nuestros servicios. El uso continuado del sitio implica la aceptación plena de estas condiciones.',
    ],
  },
  {
    id: 'servicios',
    title: 'Descripción del Servicio',
    paragraphs: [
      'Pastelería Magnolias ofrece la venta de pasteles, postres y productos de repostería de forma presencial en nuestras sucursales. El sitio web tiene como finalidad mostrar nuestro catálogo, ubicaciones y facilitar el contacto con nuestros clientes.',
      'Los precios, disponibilidad y diseños de los productos pueden cambiar sin previo aviso. Las imágenes publicadas son representativas y el producto final puede presentar variaciones menores respecto a lo mostrado.',
    ],
  },
  {
    id: 'cancelaciones',
    title: 'Cancelaciones y Devoluciones',
    paragraphs: [
      'Entendemos que pueden surgir imprevistos. Si necesitas cancelar un pedido, por favor comunícate con nosotros lo antes posible para evaluar las opciones disponibles.',
    ],
  },
  {
    id: 'propiedad',
    title: 'Propiedad Intelectual',
    paragraphs: [
      'Todo el contenido publicado en este sitio web, incluyendo textos, imágenes, logotipos, diseños y gráficos, es propiedad exclusiva de Pastelería Magnolias o de sus respectivos titulares y está protegido por las leyes de propiedad intelectual aplicables.',
      'Queda estrictamente prohibida la reproducción, distribución o modificación de cualquier contenido sin el consentimiento previo y por escrito de Pastelería Magnolias.',
    ],
  },
  {
    id: 'privacidad',
    title: 'Privacidad y Datos Personales',
    paragraphs: [
      'La información personal que nos proporciones será utilizada únicamente para gestionar tu pedido y mejorar tu experiencia como cliente. No compartimos tus datos con terceros sin tu consentimiento, salvo cuando sea requerido por ley.',
      'Al hacer uso de nuestros servicios, aceptas que podamos contactarte mediante los medios que nos hayas proporcionado para cuestiones relacionadas con tu pedido o para enviarte información sobre nuestros productos y promociones. Puedes solicitar la baja de comunicaciones en cualquier momento.',
    ],
  },
  {
    id: 'responsabilidad',
    title: 'Limitación de Responsabilidad',
    paragraphs: [
      'Pastelería Magnolias no se hace responsable por daños indirectos, incidentales o consecuentes derivados del uso de nuestros productos o servicios fuera de las condiciones normales de consumo.',
      'Nuestros productos contienen o pueden contener alérgenos como gluten, lácteos, huevo, frutos secos y otros ingredientes. Si tienes alguna alergia o intolerancia alimentaria, es tu responsabilidad informarnos antes de realizar tu pedido.',
    ],
  },
  {
    id: 'modificaciones',
    title: 'Modificaciones a los Términos',
    paragraphs: [
      'Pastelería Magnolias se reserva el derecho de actualizar o modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor a partir de su publicación en este sitio web.',
      'Te recomendamos revisar esta página periódicamente para mantenerte informado sobre cualquier cambio. El uso continuado del sitio tras la publicación de modificaciones implica la aceptación de las mismas.',
    ],
  },
  {
    id: 'contacto',
    title: 'Contacto',
    paragraphs: [
      'Si tienes preguntas, comentarios o inquietudes relacionadas con estos Términos y Condiciones, puedes comunicarte con nosotros a través de cualquiera de nuestras sucursales o por medio de los canales de contacto disponibles en el sitio.',
    ],
  },
]
</script>

<style scoped>
h1, h2 {
  font-family: Georgia, 'Times New Roman', serif;
}
</style>
