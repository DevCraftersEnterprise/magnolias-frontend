import { apiFetch } from '~/services/api.client'

// Valores exactos que devuelve/acepta el backend
export type OrderStatus = 'CREATED' | 'IN PROCESS' | 'DONE' | 'DELIVERED' | 'CANCELED'
export type OrderType   = 'DOMICILIO' | 'EVENTO' | 'VITRINA' | 'PERSONALIZADO' | 'FLOR'

export type OrderDeliveryAddress = {
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  deliveryNotes?: string | null
  receiverName?: string
  receiverPhone?: string
}

export type OrderCustomerAddress = {
  street?: string
  number?: string
  neighborhood?: string
  city?: string
}

export type OrderAuditUser = {
  name: string
  lastname: string
}

export type OrderCustomer = {
  id: string
  fullName: string
  phone?: string
  address?: OrderCustomerAddress
}

export type OrderItem = {
  id: string
  orderCode: string
  orderType?: OrderType
  deliveryDate: string
  deliveryTime?: string
  totalAmount: string
  advancePayment?: string
  remainingBalance?: string
  status: OrderStatus
  customer?: OrderCustomer
  deliveryAddress?: OrderDeliveryAddress
  createdBy?: OrderAuditUser
  updatedBy?: OrderAuditUser
  reference?: string | string[]
  createdAt: string
  updatedAt: string
}

export type OrdersResponse = {
  items: OrderItem[]
  total: number
  pagination: {
    limit: number
    offset: number
    currentPage: number
    totalPages: number
  }
}

export type OrderFilters = {
  name?: string
  clientPhone?: string
  orderStatus?: OrderStatus | ''
  orderDate?: string
  limit?: number
  offset?: number
}

// ─── Labels ────────────────────────────────────────────────────────────────
export const TYPE_LABELS: Record<OrderType, string> = {
  DOMICILIO:    'Domicilio',
  EVENTO:       'Evento',
  VITRINA:      'Vitrina',
  PERSONALIZADO:'Personalizado',
  FLOR:         'Flor',
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  'CREATED':    'Creado',
  'IN PROCESS': 'En proceso',
  'DONE':       'Finalizado',
  'DELIVERED':  'Entregado',
  'CANCELED':   'Cancelado',
}

// ─── Colors (design system del dashboard) ──────────────────────────────────
export const TYPE_COLORS: Record<OrderType, { bg: string; text: string }> = {
  DOMICILIO:    { bg: '#E6ABFA', text: '#7C00C9' },
  EVENTO:       { bg: '#AAE9FA', text: '#007C8A' },
  VITRINA:      { bg: '#D9D9D9', text: '#555555' },
  PERSONALIZADO:{ bg: '#FFD9B9', text: '#C94A00' },
  FLOR:         { bg: '#FFBEE6', text: '#C9007C' },
}

export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  'CREATED':    { bg: '#B9FFC6', text: '#00C91D' },
  'IN PROCESS': { bg: '#FFF8A9', text: '#C7B400' },
  'DONE':       { bg: '#B9D9FF', text: '#0047C9' },
  'DELIVERED':  { bg: '#FFD9B9', text: '#C94A00' },
  'CANCELED':   { bg: '#FFD9D9', text: '#C90000' },
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

  updateStatus(id: string, status: OrderStatus) {
    return apiFetch<OrderItem>(`/api/orders/${id}`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify({ status }),
    })
  },

  getOrder(id: string) {
    return apiFetch<OrderItem>(`/api/orders/${id}`, {
      method: 'GET',
      auth: true,
    })
  },
}
