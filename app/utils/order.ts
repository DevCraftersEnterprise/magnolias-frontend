import type { OrderStatus, ProductSize } from '~/types/order.types'

export const PRODUCT_SIZE_LABELS: Record<ProductSize, string> = {
    '10P': '10 P',
    '15P': '15 P',
    '20P': '20 P',
    '25P': '25 P',
    '30P': '30 P',
    '40P': '40 P',
    '50P': '50 P',
    CUSTOM: 'Personalizado',
}

type OrderTypeFlags = { isEvento?: boolean; isEnTienda?: boolean };

export function getOrderTypeLabel(order: OrderTypeFlags): string {
    if (order.isEvento) return 'Evento';
    if (order.isEnTienda) return 'En tienda';
    return 'Domicilio';
}

export function getOrderTypeColor(order: OrderTypeFlags): { bg: string; text: string } {
    if (order.isEvento) return { bg: '#AAE9FA', text: '#007C8A' };
    if (order.isEnTienda) return { bg: '#D9D9D9', text: '#555555' };
    return { bg: '#E6ABFA', text: '#7C00C9' };
}

export function getOrderMode(order: OrderTypeFlags): 'evento' | 'enTienda' | 'domicilio' {
    if (order.isEvento) return 'evento';
    if (order.isEnTienda) return 'enTienda';
    return 'domicilio';
}

export const FLOWERS_BADGE_COLOR = { bg: '#FFBEE6', text: '#C9007C' };

export const STATUS_LABELS: Record<OrderStatus, string> = {
    'CREATED': 'Creado',
    'IN PROCESS': 'En proceso',
    'DONE': 'Finalizado',
    'DELIVERED': 'Entregado',
    'CANCELED': 'Cancelado',
}

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
    'CREATED': { bg: '#B9FFC6', text: '#00C91D' },
    'IN PROCESS': { bg: '#FFF8A9', text: '#C7B400' },
    'DONE': { bg: '#B9D9FF', text: '#0047C9' },
    'DELIVERED': { bg: '#FFD9B9', text: '#C94A00' },
    'CANCELED': { bg: '#FFD9D9', text: '#C90000' },
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
    CASH: 'Efectivo',
    TRANSFER: 'Transferencia',
    CARD: 'Tarjeta',
    OTHER: 'Otro',
}

export const DELIVERY_ROUND_LABELS: Record<string, string> = {
    ROUND_1: 'Ronda 1',
    ROUND_2: 'Ronda 2',
    ROUND_3: 'Ronda 3',
    ROUND_4: 'Ronda 4',
}

export const LOCATION_LABELS: Record<string, string> = {
    TOP: "Arriba",
    BOTTOM: "Abajo",
    CENTER: "Centro",
    LEFT: "Izquierda",
    RIGHT: "Derecha",
    TOP_LEFT: "Arriba izquierda",
    TOP_RIGHT: "Arriba derecha",
    BOTTOM_LEFT: "Abajo izquierda",
    BOTTOM_RIGHT: "Abajo derecha",
    FRONT: "Frente",
    BACK: "Atrás",
    SIDE: "Lado",
};