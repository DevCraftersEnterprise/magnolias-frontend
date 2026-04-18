import { apiFetch } from '~/services/api.client'
import type { CreateUserPayload, GetUsersParams, UpdateUserPayload, UserItem, UsersResponse } from '~/types/user.types'


export const usersService = {
  getUsers(params: GetUsersParams = {}) {
    const query = new URLSearchParams()
    if (params.name) query.set('name', params.name)
    if (params.lastname) query.set('lastname', params.lastname)
    if (params.username) query.set('username', params.username)
    if (params.role) query.set('role', params.role)
    if (params.limit != null) query.set('limit', String(params.limit))
    if (params.offset != null) query.set('offset', String(params.offset))

    const qs = query.toString()
    return apiFetch<UsersResponse>(`/api/users${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      auth: true,
    })
  },

  getBakersByBranch(branchId: string) {
    return apiFetch<UserItem[]>(`/api/users/bakers/${branchId}`, {
      method: 'GET',
      auth: true,
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
