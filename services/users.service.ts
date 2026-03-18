import { apiFetch } from '~/services/api.client'

export type UserRole = 'SUPER' | 'ADMIN' | 'EMPLOYEE' | 'BAKER' | 'ASSISTANT'

export type UserItem = {
  id: string
  name: string
  lastname: string
  username: string
  role: UserRole | string
  isActive: boolean
  area: string | null
  specialty: string | null
  phone: string | null
  branch?: { id: string; name: string } | null
  branches?: { id: string; name: string }[]
  createdAt: string
  updatedAt: string
}

export type UsersResponse = {
  items: UserItem[]
  total: number
  pagination: {
    limit: number
    offset: number
    totalPages: number
    currentPage: number
  }
}

export type GetUsersParams = {
  name?: string
  lastname?: string
  username?: string
  role?: UserRole | string
  limit?: number
  offset?: number
}

export type CreateUserPayload = {
  name: string
  lastname: string
  username: string
  userkey: string
  role: UserRole | string
  branchId?: string | null
  branchIds?: string[]
  area?: string | null
  specialty?: string | null
}

export type UpdateUserPayload = {
  id: string
  name: string
  lastname: string
  username: string
  userkey?: string
  role: UserRole | string
  branchId?: string | null
  branchIds?: string[]
  area?: string | null
  specialty?: string | null
  isActive: boolean
}

export const usersService = {
  getUsers(params: GetUsersParams = {}) {
    const query = new URLSearchParams()
    if (params.name)     query.set('name',     params.name)
    if (params.lastname) query.set('lastname',  params.lastname)
    if (params.username) query.set('username',  params.username)
    if (params.role)     query.set('role',      params.role)
    if (params.limit  != null) query.set('limit',  String(params.limit))
    if (params.offset != null) query.set('offset', String(params.offset))

    const qs = query.toString()
    return apiFetch<UsersResponse>(`/api/users${qs ? `?${qs}` : ''}`, {
      method: 'GET',
    })
  },

  createUser(payload: CreateUserPayload) {
    return apiFetch<UserItem>('/api/users', {
      method: 'POST',
      body: payload,
    })
  },

  updateUser(payload: UpdateUserPayload) {
    return apiFetch<UserItem>('/api/users', {
      method: 'PATCH',
      body: payload,
    })
  },

  resetPassword(payload: { username: string; newPassword: string }) {
    return apiFetch<UserItem>('/api/users/reset-password', {
      method: 'PATCH',
      body: { username: payload.username, newPassword: payload.newPassword },
    })
  },

  deleteUser(payload: { id: string }) {
    return apiFetch<UserItem>('/api/users', {
      method: 'DELETE',
      body: { id: payload.id },
    })
  },
}
