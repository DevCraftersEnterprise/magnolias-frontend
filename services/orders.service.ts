import { apiFetch } from '~/services/api.client'

// Valores exactos que devuelve/acepta el backend
export type OrderStatus = 'CREATED' | 'IN PROCESS' | 'DONE' | 'DELIVERED' | 'CANCELED'
export type OrderType = 'DOMICILIO' | 'EVENTO' | 'VITRINA' | 'PERSONALIZADO' | 'FLOR'

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

// ─── Create order ──────────────────────────────────────────────────────────
export type CreateOrderDetail = {
  productId: string
  price: number
  quantity: number
  productSize?: string
  hasWriting: boolean
  writingText?: string
  writingLocation?: string
  pipingLocation?: string
  decorationNotes?: string
  notes?: string
  breadTypeId?: string
  colorId?: string
  fillingId?: string
  flavorId?: string
  frostingId?: string
  styleId?: string
  referenceFile?: File | null
}

export type CreateOrderFlower = {
  flowerId: string
  colorId?: string
  quantity: number
  notes?: string
}

export type CreateOrderDeliveryAddress = {
  useCustomerAddress: boolean
  newAddress?: {
    street: string
    number: string
    neighborhood: string
    city?: string
    postalCode?: string
    betweenStreets?: string
    interphoneCode?: string
    reference?: string
  }
  betweenStreets?: string
  interphoneCode?: string
  reference?: string
  deliveryNotes?: string
  receiverName?: string
  receiverPhone?: string
}

export type CreateOrderPayload = {
  orderType: OrderType
  customerId: string
  branchId: string
  advancePayment: number
  paymentMethod?: string
  ticketNumber?: string
  deliveryDate?: string
  deliveryTime?: string
  readyTime?: string
  deliveryRound?: string
  // VITRINA / FLOR-vitrina pickup
  collectionDateTime?: string
  // EVENTO
  eventTime?: string
  setupTime?: string
  branchDepartureTime?: string
  setupPersonName?: string
  eventServices?: string[]
  guestCount?: number
  dessertsTotal?: number
  setupServiceCost?: number
  // misc
  hasPhotoReference?: boolean
  requiresInvoice?: boolean
  transferAccount?: string
  deliveryAddress?: CreateOrderDeliveryAddress
  details: CreateOrderDetail[]
  flowers?: CreateOrderFlower[]
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
