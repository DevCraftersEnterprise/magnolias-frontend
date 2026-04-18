export default defineNuxtRouteMiddleware(async () => {
    const { ensureSession } = useAuth()
    const ok = await ensureSession()
    if (!ok) return navigateTo('/login')
  })
  