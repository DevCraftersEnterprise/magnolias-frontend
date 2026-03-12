import { apiFetch } from '~/services/api.client'

export type CategoryMini = { id: string; name: string }
export type ProductPicture = { imageUrl: string }

export type ProductItem = {
  id: string
  name: string
  description: string
  isFavorite: boolean
  isActive: boolean
  category: CategoryMini
  createdAt: string
  updatedAt: string
  pictures: ProductPicture[]
}

export type ProductsResponse = {
  items: ProductItem[]
  total: number
  pagination: {
    limit: number
    offset: number
    totalPages: number
    currentPage: number
  }
}

export type ProductsFilters = Partial<{
  name: string
  categoryId: string
  isActive: boolean
  isFavorite: boolean
}>

export type CreateProductPayload = {
  name: string
  description: string
  isFavorite: boolean
  categoryId: string
}

export type UploadProductPicturesPayload = {
  id: string
  name: string
  description: string
  isFavorite: boolean
  categoryId: string
  isActive: boolean
  files: File[]
}

export type PatchProductPayload = {
  id: string
  name: string
  description: string
  isFavorite: boolean
  categoryId: string
  isActive: boolean
}

export type UpdateFavoritePayload = {
  id: string
  name: string
  description: string
  isFavorite: boolean
  isActive: boolean
  categoryId: string
}

function withPagination(base: string, limit: number, offset: number, extra?: Record<string, any>) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })

  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      params.set(k, String(v))
    })
  }

  return `${base}?${params.toString()}`
}

export function getProductImageUrl(p: ProductItem): string | null {
  const url = p?.pictures?.[0]?.imageUrl
  return url ? String(url).trim() : null
}

export const productsService = {
  getProducts(limit = 10, offset = 0, filters?: ProductsFilters) {
    return apiFetch<ProductsResponse>(withPagination('/api/products', limit, offset, filters), {
      method: 'GET',
      auth: true,
    })
  },

  async getAllProducts(filters?: ProductsFilters) {
    const limit = 50
    let offset = 0
    let out: ProductItem[] = []
    let total = 0

    while (true) {
      const res = await this.getProducts(limit, offset, filters)
      out = out.concat(res.items)
      total = res.total

      offset += limit
      if (out.length >= total) break
      if (res.items.length === 0) break
    }

    return out
  },

  setFavorite(product: ProductItem, isFavorite: boolean) {
    const payload: UpdateFavoritePayload = {
      id: product.id,
      name: product.name,
      description: product.description,
      isFavorite: !!isFavorite,
      isActive: !!product.isActive,
      categoryId: product.category?.id,
    }

    return apiFetch<ProductItem>('/api/products/favorite', {
      method: 'PATCH',
      auth: true,
      body: payload,
    })
  },

  createProduct(payload: CreateProductPayload) {
    return apiFetch<ProductItem>('/api/products', {
      method: 'POST',
      auth: true,
      body: {
        ...payload,
        isFavorite: !!payload.isFavorite,
      },
    })
  },

  patchProduct(payload: PatchProductPayload) {
    return apiFetch<ProductItem>('/api/products', {
      method: 'PATCH',
      auth: true,
      body: {
        id: payload.id,
        name: payload.name,
        description: payload.description,
        isFavorite: !!payload.isFavorite,
        categoryId: payload.categoryId,
        isActive: !!payload.isActive,
      },
    })
  },

  async uploadPictures(payload: UploadProductPicturesPayload) {
    const fd = new FormData()
    fd.append('id', payload.id)
    fd.append('name', payload.name)
    fd.append('description', payload.description ?? '')
    fd.append('isFavorite', String(!!payload.isFavorite))
    fd.append('categoryId', payload.categoryId)
    fd.append('isActive', String(!!payload.isActive))

    // Si el backend realmente espera "files", esto está bien.
    // Si no funciona, lo primero a probar es cambiar "files" por "pictures".
    payload.files.forEach((f) => fd.append('files', f))

    return apiFetch<ProductItem>('/api/products/picture', {
      method: 'POST',
      auth: true,
      body: fd,
    })
  },
}