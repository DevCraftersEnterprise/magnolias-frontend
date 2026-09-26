import type { OrderDetailProductionStatus } from '~/types/order.types'

// Cliente: arrastrar tarjetas en el kanban de pastelero solo debe permitir
// avanzar, nunca retroceder ni saltar columnas (mismo comportamiento que ya
// tenía el botón "siguiente estado" por tarjeta, ahora explícito para el
// hook `move` de vuedraggable).
const FORWARD_TRANSITIONS: Record<OrderDetailProductionStatus, OrderDetailProductionStatus | null> = {
    PENDING: 'IN_PROCESS',
    IN_PROCESS: 'DONE',
    DONE: null,
}

export function isValidKanbanMove(
    from: OrderDetailProductionStatus,
    to: OrderDetailProductionStatus,
): boolean {
    return FORWARD_TRANSITIONS[from] === to
}
