import { apiFetch } from './api.client'
import type { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, ValidateTokenResponse } from '~/types/auth.types'

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