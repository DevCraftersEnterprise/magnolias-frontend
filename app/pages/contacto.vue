<template>
  <!-- Hero -->
  <section class="bg-gradient-to-br from-[#FFF0F7] via-[#FDE8F2] to-[#FAD6EA] py-16 px-5 text-center">
    <h1 class="text-3xl sm:text-4xl font-bold text-[#101541]">Contáctanos</h1>
    <p class="mt-3 text-sm sm:text-base text-[#101541]/60 max-w-lg mx-auto">
      ¿Tienes dudas o quieres hacer un pedido personalizado? Escríbenos.
    </p>
  </section>

  <!-- Formulario -->
  <section class="py-14 px-5">
    <div class="mx-auto max-w-lg">
      <form class="rounded-2xl bg-white ring-1 ring-black/5 shadow-sm p-6 sm:p-8 space-y-5" @submit.prevent="onSubmit">

        <div>
          <label class="text-xs font-semibold text-black/60">Nombre</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Tu nombre"
            required
            class="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#F472B6] transition"
          />
        </div>

        <div>
          <label class="text-xs font-semibold text-black/60">Correo electrónico</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="correo@ejemplo.com"
            required
            class="mt-1 h-11 w-full rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#F472B6] transition"
          />
        </div>

        <div>
          <label class="text-xs font-semibold text-black/60">Mensaje</label>
          <textarea
            v-model="form.message"
            rows="4"
            placeholder="Cuéntanos en qué podemos ayudarte..."
            required
            class="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#F472B6] transition resize-none"
          />
        </div>

        <!-- Feedback -->
        <p v-if="sent" class="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          ¡Mensaje enviado! Te responderemos a la brevedad.
        </p>

        <button
          type="submit"
          :disabled="sending"
          class="w-full h-11 rounded-xl bg-[#F472B6] text-sm font-semibold text-white hover:brightness-95 transition active:scale-[0.99] disabled:opacity-60"
        >
          {{ sending ? 'Enviando...' : 'Enviar mensaje' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })
useHead({ title: 'Contacto · Magnolias' })

const form = reactive({ name: '', email: '', message: '' })
const sending = ref(false)
const sent = ref(false)

async function onSubmit() {
  sending.value = true
  // TODO: conectar con endpoint de contacto
  await new Promise(r => setTimeout(r, 800))
  sent.value = true
  sending.value = false
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>
