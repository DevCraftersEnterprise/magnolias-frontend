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

function withPagination(base: string, limit: number, offset: number, extra?: Record<string, any>) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return
      params.set(k, String(v))
    })
  }
  return `${base}?${params.toString()}`
}

/** Devuelve la primera imagen del producto (si existe) */
export function getProductImageUrl(p: ProductItem): string | null {
  const url = p?.pictures?.[0]?.imageUrl
  return url ? String(url).trim() : null
}

/** payload para PATCH /api/products/favorite */
export type UpdateFavoritePayload = {
  id: string
  name: string
  description: string
  isFavorite: boolean
  isActive: boolean
  categoryId: string
}

export const productsService = {
  /** GET /api/products */
  getProducts(limit = 10, offset = 0, filters?: ProductsFilters) {
    return apiFetch<ProductsResponse>(withPagination('/api/products', limit, offset, filters), {
      method: 'GET',
      auth: true,
    })
  },

  /** Trae TODOS los productos paginando internamente */
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

  /** PATCH /api/products/favorite */
  setFavorite(product: ProductItem, isFavorite: boolean) {
    const payload: UpdateFavoritePayload = {
      id: product.id,
      name: product.name,
      description: product.description,
      isFavorite,
      isActive: product.isActive,
      categoryId: product.category?.id,
    }

    return apiFetch<ProductItem>('/api/products/favorite', {
      method: 'PATCH',
      auth: true,
      body: payload,
    })
  },

  /** POST /api/products */
  createProduct(payload: CreateProductPayload) {
    return apiFetch<ProductItem>('/api/products', {
      method: 'POST',
      auth: true,
      body: payload,
    })
  },

  /** POST /api/products/picture (multipart/form-data) */
  async uploadPictures(payload: UploadProductPicturesPayload) {
    const fd = new FormData()
    fd.append('id', payload.id)
    fd.append('name', payload.name)
    fd.append('description', payload.description ?? '')
    fd.append('isFavorite', payload.isFavorite ? '1' : '0')
    fd.append('categoryId', payload.categoryId)
    fd.append('isActive', String(payload.isActive))

    // nombre del campo: normalmente "files" o "pictures"
    // como swagger no lo especifica, usaremos "files" y si tu backend espera otro, lo cambiamos.
    payload.files.forEach((f) => fd.append('files', f))

    return apiFetch<ProductItem>('/api/products/picture', {
      method: 'POST',
      auth: true,
      body: fd,
      // IMPORTANT: apiFetch debe NO forzar 'Content-Type: application/json' cuando body es FormData
    })
  },
}