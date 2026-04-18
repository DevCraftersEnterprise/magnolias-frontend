import { apiFetch } from '~/services/api.client'
import type { CreateCustomerRequest, CustomerItem, CustomersResponse, UpdateCustomerRequest } from '~/types/customer.types'



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