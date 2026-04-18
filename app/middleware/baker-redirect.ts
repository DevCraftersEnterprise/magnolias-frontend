export default defineNuxtRouteMiddleware(async () => {
    const { ensureSession } = useAuth();
    await ensureSession();
    const { user } = useAuthUser();
    if (user.value?.role === 'BAKER') {
        return navigateTo('/admin/pedidos', { replace: true });
    }
});