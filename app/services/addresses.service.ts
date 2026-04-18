import { apiFetch } from '~/services/api.client'

export type CommonAddress = {
  id: string
  name: string
  street: string
  number: string
  neighborhood: string
  city?: string | null
  postalCode?: string | null
  interphoneCode?: string | null
  betweenStreets?: string | null
  reference?: string | null
  notes?: string | null
  usageCount?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export type CreateCommonAddressPayload = {
  name: string
  street: string
  number: string
  neighborhood: string
  city?: string
  postalCode?: string
  interphoneCode?: string
  betweenStreets?: string
  reference?: string
  notes?: string
}

export const addressesService = {
  getAddresses() {
    return apiFetch<CommonAddress[]>('/api/addresses', { method: 'GET', auth: true })
  },

  createAddress(payload: CreateCommonAddressPayload) {
    return apiFetch<CommonAddress>('/api/addresses', { method: 'POST', auth: true, body: JSON.stringify(payload) })
  },

  deleteAddress(id: string) {
    return apiFetch<void>(`/api/addresses/${id}`, { method: 'DELETE', auth: true })
  },
}
