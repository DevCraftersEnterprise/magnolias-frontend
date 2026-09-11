/**
 * Permite a SUPER/ADMIN previsualizar la navegación como la vería un PASTELERO,
 * sin tocar el rol real del usuario ni su token — las peticiones al backend
 * siguen usando el rol verdadero, esto solo afecta navegación/UI en el cliente.
 */
export const useViewAs = () => {
    const { user } = useAuthUser()
    const viewAsBaker = useState<boolean>('view_as_baker', () => false)
    // A qué pastelero se está previsualizando: un ADMIN/SUPER no es un
    // pastelero real, así que las peticiones que necesitan un bakerId (p.ej.
    // el kanban de línea asignadas) deben usar este id en vez del id del
    // usuario autenticado.
    const viewAsBakerId = useState<string>('view_as_baker_id', () => '')

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
        viewAsBakerId.value = ''
    }

    return {
        viewAsBaker,
        viewAsBakerId,
        canToggleViewAs,
        effectiveRole,
        enterViewAsBaker,
        exitViewAs,
    }
}
