export default defineNuxtRouteMiddleware(async () => {
    const { ensureSession } = useAuth();
    await ensureSession();
    const { effectiveRole } = useViewAs();
    if (effectiveRole.value === 'BAKER') {
        return navigateTo('/admin/pedidos', { replace: true });
    }
});