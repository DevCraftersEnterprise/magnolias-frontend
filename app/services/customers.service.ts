import { apiFetch } from '~/services/api.client'

export type CustomerAddress = {
  id: string
  street: string | null
  number: string | null
  neighborhood: string | null
  city: string | null
  postalCode: string | null
  interphoneCode: string | null
  betweenStreets: string | null
  reference: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type CustomerItem = {
  id: string
  fullName: string
  phone: string
  alternativePhone: string | null
  email: string | null
  notes: string | null
  isActive: boolean
  address: CustomerAddress | null
  createdAt: string
  updatedAt: string
}

export type CustomersResponse = {
  items: CustomerItem[]
  total: number
  pagination: { limit: number; offset: number; totalPages: number; currentPage: number }
}

/** ===== Create DTOs ===== */
export type CreateCustomerAddress = {
  street: string
  number: string
  neighborhood: string
  city?: string | null
  postalCode?: string | null
  interphoneCode?: string | null
  betweenStreets?: string | null
  reference?: string | null
  notes?: string | null
}

export type CreateCustomerRequest = {
  fullName: string
  phone: string
  alternativePhone?: string | null
  email?: string | null
  address?: CreateCustomerAddress | null
  notes?: string | null
}

// PATCH DTOs
export type UpdateCustomerRequest = {
  fullName?: string
  phone?: string
  alternativePhone?: string | null
  email?: string | null
  address?: CreateCustomerAddress | null
  notes?: string | null
  isActive?: boolean
}

export const customersService = {
  getCustomers(params: {
    phone?: string
    name?: string
    isActive?: boolean
    limit?: number
    offset?: number
  }) {
    const q = new URLSearchParams()
    if (params.name) q.set('name', params.name)
    if (params.phone) q.set('phone', params.phone)
    if (params.isActive !== undefined) q.set('isActive', String(params.isActive))
    q.set('limit', String(params.limit ?? 10))
    q.set('offset', String(params.offset ?? 0))

    return apiFetch<CustomersResponse>(`/api/customers?${q.toString()}`, {
      method: 'GET',
      auth: true,
    })
  },

  createCustomer(payload: CreateCustomerRequest) {
    return apiFetch<CustomerItem>(`/api/customers`, {
      method: 'POST',
      auth: true,
      body: payload,
    })
  },
  updateCustomer(id: string, payload: UpdateCustomerRequest) {
    return apiFetch<CustomerItem>(`/api/customers/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    })
  },
  deleteCustomer(id: string) {
    return apiFetch<void>(`/api/customers/${id}`, {
      method: 'DELETE',
      auth: true,
    })
  },
}