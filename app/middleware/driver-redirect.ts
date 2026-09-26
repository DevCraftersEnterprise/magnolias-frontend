export default defineNuxtRouteMiddleware(async () => {
    const { ensureSession } = useAuth();
    await ensureSession();
    const { effectiveRole } = useViewAs();
    if (effectiveRole.value === 'DRIVER') {
        return navigateTo('/admin/pedidos/reparto', { replace: true });
    }
});
