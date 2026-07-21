import { apiFetch } from '~/services/api.client'
import type { CategoryItem, CreateCategoryPayload, PatchCategoryPayload } from '~/types/product.types'

export const categoriesService = {
  getAll() {
    return apiFetch<CategoryItem[]>('/api/categories', {
      method: 'GET',
      auth: true,
    })
  },

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