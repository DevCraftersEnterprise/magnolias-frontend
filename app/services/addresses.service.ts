import { apiFetch } from '~/services/api.client'
import type { CommonAddress, CreateCommonAddressPayload } from '~/types/address.types'

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
