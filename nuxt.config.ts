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
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
});