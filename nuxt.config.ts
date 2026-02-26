// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  css: [
    '@fontsource/inter/400.css',
    '@fontsource/inter/500.css',
    '@fontsource/inter/600.css',
    '@fontsource/inter/700.css',
    '@/assets/css/tailwind.css', // si ya lo tienes
  ],
  runtimeConfig: {
    public: {
      apiBase: '',
    },
  },
})


