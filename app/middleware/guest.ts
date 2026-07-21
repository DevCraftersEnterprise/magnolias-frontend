export default defineNuxtRouteMiddleware(() => {
    const token = useCookie<string | null>('access_token').value
    if (token) return navigateTo('/admin')
  })
  