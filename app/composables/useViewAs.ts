/**
 * Permite a SUPER/ADMIN previsualizar la navegación como la vería un PASTELERO
 * o, desde el cliente #8, un REPARTIDOR, sin tocar el rol real del usuario ni
 * su token — las peticiones al backend siguen usando el rol verdadero, esto
 * solo afecta navegación/UI en el cliente. Los dos modos son mutuamente
 * excluyentes: activar uno apaga el otro.
 */
export const useViewAs = () => {
    const { user } = useAuthUser()
    const viewAsBaker = useState<boolean>('view_as_baker', () => false)
    // A qué pastelero se está previsualizando: un ADMIN/SUPER no es un
    // pastelero real, así que las peticiones que necesitan un bakerId (p.ej.
    // el kanban de línea asignadas) deben usar este id en vez del id del
    // usuario autenticado.
    const viewAsBakerId = useState<string>('view_as_baker_id', () => '')

    const viewAsDriver = useState<boolean>('view_as_driver', () => false)
    // Análogo a viewAsBakerId, pero para la lista de entregas del repartidor.
    const viewAsDriverId = useState<string>('view_as_driver_id', () => '')

    const canToggleViewAs = computed(
        () => user.value?.role === 'ADMIN' || user.value?.role === 'SUPER',
    )

    const effectiveRole = computed(() => {
        if (canToggleViewAs.value && viewAsBaker.value) return 'BAKER'
        if (canToggleViewAs.value && viewAsDriver.value) return 'DRIVER'
        return user.value?.role ?? ''
    })

    async function enterViewAsBaker() {
        if (!canToggleViewAs.value) return
        viewAsDriver.value = false
        viewAsDriverId.value = ''
        viewAsBaker.value = true
        await navigateTo('/admin/pedidos')
    }

    async function enterViewAsDriver() {
        if (!canToggleViewAs.value) return
        viewAsBaker.value = false
        viewAsBakerId.value = ''
        viewAsDriver.value = true
        await navigateTo('/admin/pedidos/reparto')
    }

    function exitViewAs() {
        viewAsBaker.value = false
        viewAsBakerId.value = ''
        viewAsDriver.value = false
        viewAsDriverId.value = ''
    }

    return {
        viewAsBaker,
        viewAsBakerId,
        viewAsDriver,
        viewAsDriverId,
        canToggleViewAs,
        effectiveRole,
        enterViewAsBaker,
        enterViewAsDriver,
        exitViewAs,
    }
}
