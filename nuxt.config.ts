// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  ssr: false,

  runtimeConfig: {
    public: {
      apiBase: '',
    },
  },
  vite: {
    ssr: {
      noExternal: ['three']
    }
  },
  nitro: {
    // El trazador de dependencias de Nitro (@vercel/nft) para presets
    // serverless (netlify/vercel) a veces no logra incluir correctamente
    // los subpaths de paquetes con "exports" condicional en package.json
    // (ej. vue/index.mjs) dentro de la función desplegada, aunque el build
    // local sí funcione — bug conocido de la comunidad Nuxt/Nitro. Se
    // fuerza a inlinear vue en el bundle en vez de dejarlo como
    // dependencia externa resuelta en runtime, para no depender de esa
    // traza.
    externals: {
      inline: ['vue'],
    },
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
});