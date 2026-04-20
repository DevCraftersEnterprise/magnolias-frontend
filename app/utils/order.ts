import type { OrderType, OrderStatus } from '~/types/order.types'

export const TYPE_LABELS: Record<OrderType, string> = {
    DOMICILIO: 'Domicilio',
    EVENTO: 'Evento',
    VITRINA: 'Vitrina',
    PERSONALIZADO: 'Personalizado',
    FLOR: 'Flor',
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
    'CREATED': 'Creado',
    'IN PROCESS': 'En proceso',
    'DONE': 'Finalizado',
    'DELIVERED': 'Entregado',
    'CANCELED': 'Cancelado',
}

export const TYPE_COLORS: Record<OrderType, { bg: string; text: string }> = {
    DOMICILIO: { bg: '#E6ABFA', text: '#7C00C9' },
    EVENTO: { bg: '#AAE9FA', text: '#007C8A' },
    VITRINA: { bg: '#D9D9D9', text: '#555555' },
    PERSONALIZADO: { bg: '#FFD9B9', text: '#C94A00' },
    FLOR: { bg: '#FFBEE6', text: '#C9007C' },
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