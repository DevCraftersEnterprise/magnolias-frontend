import { apiFetch } from '~/services/api.client'
import type { CreateProductPayload, PatchProductPayload, ProductItem, ProductsFilters, ProductsResponse, UpdateFavoritePayload, UploadProductPicturesPayload } from '~/types/product.types'

/** Devuelve la primera imagen del producto (si existe) */
export function getProductImageUrl(p: ProductItem): string | null {
  const url = p?.pictures?.[0]?.imageUrl
  return url ? String(url).trim() : null
}

export const productsService = {
  /** GET /api/products (requiere token) */
  getProducts(limit = 10, offset = 0, filters?: ProductsFilters) {
    return apiFetch<ProductsResponse>(withPagination('/api/products', limit, offset, filters), {
      method: 'GET',
      auth: true,
    })
  },

  /** GET /api/products sin token — para uso en landing pública */
  getPublicProducts(limit = 10, offset = 0, filters?: ProductsFilters) {
    return apiFetch<ProductsResponse>(withPagination('/api/products', limit, offset, filters), {
      method: 'GET',
      auth: false,
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

  /** GET /api/products/:id */
  getProductById(id: string) {
    return apiFetch<ProductItem>(`/api/products/${id}`, {
      method: 'GET',
      auth: true,
    })
  },

  /** PATCH /api/products/favorite */
  setFavorite(product: ProductItem, isFavorite: boolean) {
    const payload: UpdateFavoritePayload = {
      name: product.name,
      description: product.description,
      isFavorite,
      isActive: product.isActive,
      categoryId: product.category.id
    }

    return apiFetch<ProductItem>(`/api/products/favorite/${product.id}`, {
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

  /** PATCH /api/products */
  patchProduct(payload: PatchProductPayload) {
    return apiFetch<ProductItem>(`/api/products/${payload.id}`, {
      method: 'PATCH',
      auth: true,
      body: {
        name: payload.name,
        description: payload.description,
        isFavorite: payload.isFavorite,
        categoryId: payload.categoryId,
        isActive: payload.isActive,
        isPublic: payload.isPublic,
      },
    })
  },

  /** POST /api/products/picture (multipart/form-data) */
  async uploadPictures(payload: UploadProductPicturesPayload) {
    const fd = new FormData()

    // nombre del campo: normalmente "files" o "pictures"
    // como swagger no lo especifica, usaremos "files" y si tu backend espera otro, lo cambiamos.
    payload.files.forEach((f) => fd.append('files', f))

    return apiFetch<ProductItem>(`/api/products/picture/${payload.id}`, {
      method: 'POST',
      auth: true,
      body: fd,
      // IMPORTANT: apiFetch debe NO forzar 'Content-Type: application/json' cuando body es FormData
    })
  },

  /** DELETE /api/products/picture/{id} */
  async deletePicture(pictureId: string) {
    return apiFetch<void>(`/api/products/picture/${pictureId}`, {
      method: 'DELETE',
      auth: true,
    })
  },

  async deactivateProduct(productId: string) {
    return apiFetch<void>(`/api/products/${productId}`, {
      method: 'DELETE',
      auth: true,
    })
  }
}