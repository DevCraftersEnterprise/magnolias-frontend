import { apiFetch } from '~/services/api.client'

export type CategoryItem = {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type CreateCategoryPayload = {
  name: string
  description: string
}

export type PatchCategoryPayload = Partial<{
  name: string
  description: string
  isActive: boolean
}>

export const categoriesService = {
  create(payload: CreateCategoryPayload) {
    return apiFetch<CategoryItem>('/api/categories', {
      method: 'POST',
      auth: true,
      body: payload,
    })
  },

  patch(id: string, payload: PatchCategoryPayload) {
    return apiFetch<CategoryItem>(`/api/categories/${id}`, {
      method: 'PATCH',
      auth: true,
      body: payload,
    })
  },
}