// ~/services/products.service.ts
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

export const productsService = {
  /** GET /api/products */
  getProducts(limit = 10, offset = 0, filters?: ProductsFilters) {
    return apiFetch<ProductsResponse>(withPagination('/api/products', limit, offset, filters), {
      method: 'GET',
      auth: true,
    })
  },

  /** Trae TODOS los productos paginando internamente (útil para agrupar por categoría en frontend) */
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

  /** (Opcional) Si tu backend tiene PATCH para favorito, lo conectamos aquí luego */
  // setFavorite(productId: string, isFavorite: boolean) {
  //   return apiFetch<ProductItem>(`/api/products/${productId}`, {
  //     method: 'PATCH',
  //     auth: true,
  //     body: { isFavorite },
  //   })
  // },
}