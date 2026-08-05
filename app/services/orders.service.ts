import { apiFetch } from '~/services/api.client'
import type { CreateOrderPayload, OrderDetail, OrderDetailAssignmentCard, OrderDetailItem, OrderDetailProductionStatus, OrderFilters, OrderItem, OrderLineAssignment, OrdersResponse, OrderStatus, UpdateOrderPayload } from '~/types/order.types';

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

  /** Override manual (solo SUPER/ADMIN) - el estado normalmente se deriva
   *  automáticamente del avance de producción de cada línea (ver
   *  updateDetailProductionStatus). */
  markInProcess(id: string) {
    return apiFetch<OrderItem>(`/api/orders/in-process`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ id }),
    })
  },

  /** Override manual (solo SUPER/ADMIN) - ver nota en markInProcess. */
  markDone(id: string) {
    return apiFetch<OrderItem>(`/api/orders/done`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ id }),
    })
  },

  markDelivered(id: string, employeeActionToken?: string) {
    return apiFetch<OrderItem>(`/api/orders/delivered`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ id, employeeActionToken }),
    })
  },

  getOrder(id: string) {
    return apiFetch<OrderDetail>(`/api/orders/${id}`, {
      method: 'GET',
      auth: true,
    })
  },

  updateOrder(payload: UpdateOrderPayload) {
    const hasFiles = (payload.details ?? []).some(
      (d) => d.referenceFiles && d.referenceFiles.length > 0,
    )
    if (hasFiles) {
      const form = new FormData()
      const { details, flowers, deliveryAddress, eventServices, ...scalars } = payload
      const detailsMeta = (details ?? []).map(({ referenceFiles, ...d }) => d)
      Object.entries(scalars).forEach(([key, value]) => {
        if (value !== undefined && value !== null) form.append(key, String(value))
      })
      form.append('details', JSON.stringify(detailsMeta))
      if (flowers && flowers.length > 0) form.append('flowers', JSON.stringify(flowers))
      if (deliveryAddress) form.append('deliveryAddress', JSON.stringify(deliveryAddress))
      if (eventServices && eventServices.length > 0) form.append('eventServices', JSON.stringify(eventServices))
      const referenceImageDetailIndex: number[] = []
        ; (details ?? []).forEach((d, detailIndex) => {
          (d.referenceFiles ?? []).forEach((file) => {
            form.append('referenceImages', file)
            referenceImageDetailIndex.push(detailIndex)
          })
        })
      if (referenceImageDetailIndex.length > 0) {
        form.append('referenceImageDetailIndex', JSON.stringify(referenceImageDetailIndex))
      }
      return apiFetch<OrderDetail>(`/api/orders`, { method: 'PATCH', auth: true, body: form })
    }
    return apiFetch<OrderDetail>(`/api/orders`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    })
  },

  hideOrderDetailReferenceImage(imageId: string) {
    return apiFetch<void>(`/api/orders/details/reference-image/${imageId}`, {
      method: 'DELETE',
      auth: true,
    })
  },

  cancelOrder(id: string, reason: string, employeeActionToken?: string) {
    return apiFetch<void>(`/api/orders/cancel`, {
      method: 'DELETE',
      auth: true,
      body: JSON.stringify({ id, reason, employeeActionToken }),
    })
  },

  /** Asigna (o reasigna, si ya tenía) un repostero a una línea de producto. */
  assignOrderDetail(orderDetailId: string, bakerId: string, notes?: string) {
    return apiFetch<OrderLineAssignment>(
      `/api/orders/details/${orderDetailId}/assign`,
      { method: 'POST', auth: true, body: JSON.stringify({ bakerId, ...(notes ? { notes } : {}) }) },
    )
  },

  /** Líneas de producto asignadas a un repostero (para su kanban). */
  getBakerDetailAssignments(bakerId: string) {
    return apiFetch<OrderDetailAssignmentCard[]>(
      `/api/orders/details/assignments/${bakerId}`,
      { method: 'GET', auth: true },
    )
  },

  /** Avanza el estado de producción de una línea de producto puntual. */
  updateDetailProductionStatus(orderDetailId: string, status: OrderDetailProductionStatus) {
    return apiFetch<OrderDetailItem & { order: { id: string; status: OrderStatus } }>(
      `/api/orders/details/${orderDetailId}/production-status`,
      { method: 'PATCH', auth: true, body: JSON.stringify({ status }) },
    )
  },

  createOrder(payload: CreateOrderPayload) {
    // If any product carries reference images, send as multipart FormData
    const hasFiles = payload.details.some(d => d.referenceFiles && d.referenceFiles.length > 0)
    if (hasFiles) {
      const form = new FormData()
      // Destructure complex/nested fields that cannot be safely stringified with String()
      const { details, flowers, deliveryAddress, eventServices, ...scalars } = payload
      const detailsMeta = details.map(({ referenceFiles, ...d }) => d)
      // Append primitive/scalar fields directly
      Object.entries(scalars).forEach(([key, value]) => {
        if (value !== undefined && value !== null) form.append(key, String(value))
      })
      // Append complex fields as JSON strings so the backend can parse them
      form.append('details', JSON.stringify(detailsMeta))
      if (flowers && flowers.length > 0) form.append('flowers', JSON.stringify(flowers))
      if (deliveryAddress) form.append('deliveryAddress', JSON.stringify(deliveryAddress))
      if (eventServices && eventServices.length > 0) form.append('eventServices', JSON.stringify(eventServices))
      // Flatten reference images across details, tracking which detail each file belongs to
      const referenceImageDetailIndex: number[] = []
      details.forEach((d, detailIndex) => {
        (d.referenceFiles ?? []).forEach((file) => {
          form.append('referenceImages', file)
          referenceImageDetailIndex.push(detailIndex)
        })
      })
      if (referenceImageDetailIndex.length > 0) {
        form.append('referenceImageDetailIndex', JSON.stringify(referenceImageDetailIndex))
      }
      return apiFetch<OrderItem>('/api/orders', { method: 'POST', auth: true, body: form })
    }
    const { details, ...rest } = payload
    const detailsMeta = details.map(({ referenceFiles, ...d }) => d)
    const jsonBody = { ...rest, details: detailsMeta }
    return apiFetch<OrderItem>('/api/orders', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(jsonBody),
    })
  },
}
