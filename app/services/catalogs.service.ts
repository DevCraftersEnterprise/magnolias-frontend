import { apiFetch } from './api.client'
import type { BreadTypeItem, ColorItem, CreateCatalogPayload, CreateColorPayload, FillingItem, FlavorItem, FlowerItem, FrostingItem, StyleItem, UpdateCatalogPayload } from '~/types/catalog.types';


export const catalogsService = {
  /** ===== GET ===== */
  getColors() {
    return apiFetch<ColorItem[]>('/api/colors', { method: 'GET', auth: true })
  },

  getBreadTypes(limit: number = 10, offset: number = 0) {
    return apiFetch<{ items: BreadTypeItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      withPagination('/api/bread-types', limit, offset),
      { method: 'GET', auth: true }
    )
  },

  getFillings(limit: number = 10, offset: number = 0) {
    return apiFetch<{ items: FillingItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      withPagination('/api/fillings', limit, offset),
      { method: 'GET', auth: true }
    )
  },

  getFlavors(limit: number = 10, offset: number = 0) {
    return apiFetch<{ items: FlavorItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      withPagination('/api/flavors', limit, offset),
      { method: 'GET', auth: true }
    )
  },

  getFrostings(limit: number = 10, offset: number = 0, isActive: boolean = true) {
    return apiFetch<{ items: FrostingItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      withPagination('/api/frostings', limit, offset, { isActive }),
      { method: 'GET', auth: true }
    )
  },

  getStyles(limit: number = 10, offset: number = 0, isActive: boolean = true) {
    return apiFetch<{ items: StyleItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      withPagination('/api/styles', limit, offset, { isActive }),
      { method: 'GET', auth: true }
    )
  },

  getFlowers(limit: number = 10, offset: number = 0, isActive: boolean = true) {
    return apiFetch<{ items: FlowerItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      withPagination('/api/flowers', limit, offset, { isActive }),
      { method: 'GET', auth: true }
    )
  },

  /** ===== POST (Create) ===== */
  createBreadType(payload: CreateCatalogPayload) {
    return apiFetch<BreadTypeItem>('/api/bread-types', { method: 'POST', auth: true, body: payload })
  },
  createFilling(payload: CreateCatalogPayload) {
    return apiFetch<FillingItem>('/api/fillings', { method: 'POST', auth: true, body: payload })
  },
  createFlavor(payload: CreateCatalogPayload) {
    return apiFetch<FlavorItem>('/api/flavors', { method: 'POST', auth: true, body: payload })
  },
  createFrosting(payload: CreateCatalogPayload) {
    return apiFetch<FrostingItem>('/api/frostings', { method: 'POST', auth: true, body: payload })
  },
  createStyle(payload: CreateCatalogPayload) {
    return apiFetch<StyleItem>('/api/styles', { method: 'POST', auth: true, body: payload })
  },
  createFlower(payload: CreateCatalogPayload) {
    return apiFetch<FlowerItem>('/api/flowers', { method: 'POST', auth: true, body: payload })
  },
  createColor(payload: CreateColorPayload) {
    return apiFetch<ColorItem>('/api/colors', { method: 'POST', auth: true, body: payload })
  },

  /** ===== PATCH (Update) ===== */
  patchBreadType(id: string, payload: UpdateCatalogPayload) {
    return apiFetch<BreadTypeItem>(`/api/bread-types/${id}`, { method: 'PATCH', auth: true, body: payload })
  },
  patchFilling(id: string, payload: UpdateCatalogPayload) {
    return apiFetch<FillingItem>(`/api/fillings/${id}`, { method: 'PATCH', auth: true, body: payload })
  },
  patchFlavor(id: string, payload: UpdateCatalogPayload) {
    return apiFetch<FlavorItem>(`/api/flavors/${id}`, { method: 'PATCH', auth: true, body: payload })
  },
  patchFrosting(id: string, payload: UpdateCatalogPayload) {
    return apiFetch<FrostingItem>(`/api/frostings/${id}`, { method: 'PATCH', auth: true, body: payload })
  },
  patchStyle(id: string, payload: UpdateCatalogPayload) {
    return apiFetch<StyleItem>(`/api/styles/${id}`, { method: 'PATCH', auth: true, body: payload })
  },
  patchFlower(id: string, payload: UpdateCatalogPayload) {
    return apiFetch<FlowerItem>(`/api/flowers/${id}`, { method: 'PATCH', auth: true, body: payload })
  },

  /** ===== DELETE (Soft delete) ===== */
  deleteBreadType(id: string) {
    return apiFetch<void>(`/api/bread-types/${id}`, { method: 'DELETE', auth: true })
  },
  deleteFilling(id: string) {
    return apiFetch<void>(`/api/fillings/${id}`, { method: 'DELETE', auth: true })
  },
  deleteFlavor(id: string) {
    return apiFetch<void>(`/api/flavors/${id}`, { method: 'DELETE', auth: true })
  },
  deleteFrosting(id: string) {
    return apiFetch<void>(`/api/frostings/${id}`, { method: 'DELETE', auth: true })
  },
  deleteStyle(id: string) {
    return apiFetch<void>(`/api/styles/${id}`, { method: 'DELETE', auth: true })
  },
  deleteFlower(id: string) {
    return apiFetch<void>(`/api/flowers/${id}`, { method: 'DELETE', auth: true })
  },
  deleteColor(id: string) {
    return apiFetch<void>(`/api/colors/${id}`, { method: 'DELETE', auth: true })
  },
}