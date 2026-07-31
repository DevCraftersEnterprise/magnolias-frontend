import { apiFetch } from '~/services/api.client'
import type { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, ValidateTokenResponse, VerifyDiscountAuthorizationRequest, VerifyDiscountAuthorizationResponse } from '~/types/auth.types'

export const authService = {
  login(payload: LoginRequest) {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      auth: false,
    })
  },

  verifyDiscountAuthorization(payload: VerifyDiscountAuthorizationRequest) {
    return apiFetch<VerifyDiscountAuthorizationResponse>('/api/auth/verify-discount-authorization', {
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