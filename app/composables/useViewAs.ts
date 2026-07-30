/**
 * Permite a SUPER/ADMIN previsualizar la navegación como la vería un PASTELERO,
 * sin tocar el rol real del usuario ni su token — las peticiones al backend
 * siguen usando el rol verdadero, esto solo afecta navegación/UI en el cliente.
 */
export const useViewAs = () => {
    const { user } = useAuthUser()
    const viewAsBaker = useState<boolean>('view_as_baker', () => false)

    const canToggleViewAs = computed(
        () => user.value?.role === 'ADMIN' || user.value?.role === 'SUPER',
    )

    const effectiveRole = computed(() =>
        canToggleViewAs.value && viewAsBaker.value ? 'BAKER' : (user.value?.role ?? ''),
    )

    async function enterViewAsBaker() {
        if (!canToggleViewAs.value) return
        viewAsBaker.value = true
        await navigateTo('/admin/pedidos')
    }

    function exitViewAs() {
        viewAsBaker.value = false
    }

    return { viewAsBaker, canToggleViewAs, effectiveRole, enterViewAsBaker, exitViewAs }
}
