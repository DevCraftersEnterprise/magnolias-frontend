export default defineNuxtRouteMiddleware(async (to) => {
    if (!to.path.startsWith('/admin')) return

    const { ensureSession } = useAuth()
    const ok = await ensureSession()
    if (!ok) return navigateTo('/login')
})