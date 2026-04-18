import { apiFetch } from '~/services/api.client'
import type { CreateOrderPayload, OrderDetail, OrderFilters, OrderItem, OrdersResponse, OrderStatus, OrderType, UpdateOrderPayload } from '~/types/order.types';

// ─── Labels ────────────────────────────────────────────────────────────────
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

// ─── Colors (design system del dashboard) ──────────────────────────────────
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



// ─── Service ───────────────────────────────────────────────────────────────
export const ordersService = {
  /** branchId va en el PATH — es obligatorio por ahora */
  getOrders(branchId: string, filters: OrderFilters = {}) {
    const q = new URLSearchParams()
    const { limit = 15, offset = 0, ...rest } = filters
    q.set('limit', String(limit))
    q.set('offset', String(offset))
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
    })
    return apiFetch<OrdersResponse>(`/api/orders/branch/${branchId}?${q.toString()}`, {
      method: 'GET',
      auth: true,
    })
  },

  markInProcess(id: string) {
    return apiFetch<OrderItem>(`/api/orders/in-process`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ id }),
    })
  },

  markDone(id: string) {
    return apiFetch<OrderItem>(`/api/orders/done`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ id }),
    })
  },

  markDelivered(id: string) {
    return apiFetch<OrderItem>(`/api/orders/delivered`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ id }),
    })
  },

  getOrder(id: string) {
    return apiFetch<OrderDetail>(`/api/orders/${id}`, {
      method: 'GET',
      auth: true,
    })
  },

  updateOrder(payload: UpdateOrderPayload) {
    return apiFetch<OrderDetail>(`/api/orders`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    })
  },

  cancelOrder(id: string, reason: string) {
    return apiFetch<void>(`/api/orders/cancel`, {
      method: 'DELETE',
      auth: true,
      body: JSON.stringify({ id, reason }),
    })
  },

  assignOrder(bakerId: string, orderId: string, notes?: string) {
    return apiFetch<{ id: string; assignedDate: string; notes: string | null; createdAt: string; updatedAt: string }>(
      `/api/orders/${bakerId}/assign-order`,
      { method: 'POST', auth: true, body: JSON.stringify({ orderId, ...(notes ? { notes } : {}) }) },
    )
  },

  reassignOrder(newBakerId: string, orderId: string, notes?: string) {
    return apiFetch<{ id: string; assignedDate: string; notes: string | null; createdAt: string; updatedAt: string }>(
      `/api/orders/${newBakerId}/reassign-order`,
      { method: 'PATCH', auth: true, body: JSON.stringify({ orderId, ...(notes ? { notes } : {}) }) },
    )
  },

  createOrder(payload: CreateOrderPayload) {
    // If any product carries a reference image, send as multipart FormData
    const hasFiles = payload.details.some(d => d.referenceFile)
    if (hasFiles) {
      const form = new FormData()
      // Destructure complex/nested fields that cannot be safely stringified with String()
      const { details, flowers, deliveryAddress, eventServices, ...scalars } = payload
      const detailsMeta = details.map(({ referenceFile, ...d }) => d)
      // Append primitive/scalar fields directly
      Object.entries(scalars).forEach(([key, value]) => {
        if (value !== undefined && value !== null) form.append(key, String(value))
      })
      // Append complex fields as JSON strings so the backend can parse them
      form.append('details', JSON.stringify(detailsMeta))
      if (flowers && flowers.length > 0) form.append('flowers', JSON.stringify(flowers))
      if (deliveryAddress) form.append('deliveryAddress', JSON.stringify(deliveryAddress))
      if (eventServices && eventServices.length > 0) form.append('eventServices', JSON.stringify(eventServices))
      // Append reference images
      details.forEach((d) => {
        if (d.referenceFile) form.append('referenceImages', d.referenceFile)
      })
      return apiFetch<OrderItem>('/api/orders', { method: 'POST', auth: true, body: form })
    }
    const { details, ...rest } = payload
    const detailsMeta = details.map(({ referenceFile, ...d }) => d)
    const jsonBody = { ...rest, details: detailsMeta }
    return apiFetch<OrderItem>('/api/orders', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(jsonBody),
    })
  },
}
