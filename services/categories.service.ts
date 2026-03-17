import { apiFetch } from '~/services/api.client'

export type ProductPicture = {
  id: string
  imageUrl: string
  isActive: boolean
}

export type ProductItem = {
  id: string
  name: string
  description: string
  isFavorite: boolean
  isActive: boolean
  category: {
    id: string
  }
  createdAt: string
  updatedAt: string
  pictures: ProductPicture[]
}

export type CategoryItem = {
  id: string
  name: string
  description: string
  isActive: boolean
  products: ProductItem[]
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