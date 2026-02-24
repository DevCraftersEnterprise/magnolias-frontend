import { apiFetch } from './api.client'

export type ColorItem = {
  id: string
  value: string // hex: "#FFB6C1"
  name: string
  isActive: boolean
}

export type BreadTypeItem = {
  id: string
  name: string
  description: string
  isActive: boolean
}

export type FillingItem = {
  id: string
  name: string
  description: string
  isActive: boolean
}

export type FlavorItem = {
  id: string
  name: string
  description: string
  isActive: boolean
}

export type FrostingItem = {
  id: string
  name: string
  description: string
  isActive: boolean
}

export type StyleItem = {
  id: string
  name: string
  description: string
  isActive: boolean
}

export type FlowerItem = {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const catalogsService = {
  getColors() {
    return apiFetch<ColorItem[]>('/api/colors', {
      method: 'GET',
      auth: true,
    })
  },
  getBreadTypes(limit: number = 10, offset: number = 0) {
    return apiFetch<{ items: BreadTypeItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      `/api/bread-types?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        auth: true,
      }
    )
  },
  getFillings(limit: number = 10, offset: number = 0) {
    return apiFetch<{ items: FillingItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      `/api/fillings?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        auth: true,
      }
    )
  },
  getFlavors(limit: number = 10, offset: number = 0) {
    return apiFetch<{ items: FlavorItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      `/api/flavors?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        auth: true,
      }
    )
  },
  getFrostings(limit: number = 10, offset: number = 0, isActive: boolean = true) {
    return apiFetch<{ items: FrostingItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      `/api/frostings?limit=${limit}&offset=${offset}&isActive=${isActive}`,
      {
        method: 'GET',
        auth: true,
      }
    )
  },
  getStyles(limit: number = 10, offset: number = 0, isActive: boolean = true) {
    return apiFetch<{ items: StyleItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      `/api/styles?limit=${limit}&offset=${offset}&isActive=${isActive}`,
      {
        method: 'GET',
        auth: true,
      }
    )
  },
  getFlowers(limit: number = 10, offset: number = 0, isActive: boolean = true) {
    return apiFetch<{ items: FlowerItem[]; total: number; pagination: { limit: number; offset: number; totalPages: number; currentPage: number } }>(
      `/api/flowers?limit=${limit}&offset=${offset}&isActive=${isActive}`,
      {
        method: 'GET',
        auth: true,
      }
    )
  },
}