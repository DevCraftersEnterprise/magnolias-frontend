import { apiFetch } from './api.client'

export type LoginRequest = {
  username: string
  userkey: string
}

export type LoginResponse = {
  message: string
  accessToken: string
  refreshToken: string
}

export type RefreshRequest = {
  refreshToken: string
}

export type AuthUser = {
  id: string
  username: string
  isActive: boolean
  role: 'ADMIN' | 'SUPER' | 'EMPLOYEE' | 'USER' | string
}

export type RefreshResponse = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export type ValidateTokenResponse = {
  valid: boolean
  user: AuthUser
}

export const authService = {
  login(payload: LoginRequest) {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false,
    })
  },

  refresh(payload: RefreshRequest) {
    return apiFetch<RefreshResponse>('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false,
    })
  },

  validate() {
    return apiFetch<ValidateTokenResponse>('/api/auth/validate-token', {
      method: 'GET',
      auth: true,
    })
  },
}