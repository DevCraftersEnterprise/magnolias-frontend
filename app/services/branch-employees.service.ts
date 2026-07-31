import { apiFetch } from '~/services/api.client'
import type {
  BranchEmployeeItem,
  BranchEmployeesResponse,
  CreateBranchEmployeePayload,
  RegenerateBranchEmployeePinResponse,
  UpdateBranchEmployeePayload,
  VerifyEmployeePinPayload,
  VerifyEmployeePinResponse,
} from '~/types/branch-employee.types'

function withPagination(base: string, limit: number, offset: number) {
  const q = new URLSearchParams()
  q.set('limit', String(limit))
  q.set('offset', String(offset))
  return `${base}?${q.toString()}`
}

export const branchEmployeesService = {
  getBranchEmployees(branchId: string, limit: number = 10, offset: number = 0) {
    return apiFetch<BranchEmployeesResponse>(
      withPagination(`/api/branch-employees/branch/${branchId}`, limit, offset),
      { method: 'GET', auth: true },
    )
  },

  createBranchEmployee(payload: CreateBranchEmployeePayload) {
    return apiFetch<BranchEmployeeItem>('/api/branch-employees', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(payload),
    })
  },

  updateBranchEmployee(id: string, payload: UpdateBranchEmployeePayload) {
    return apiFetch<BranchEmployeeItem>(`/api/branch-employees/${id}`, {
      method: 'PATCH',
      auth: true,
      body: JSON.stringify(payload),
    })
  },

  deleteBranchEmployee(id: string) {
    return apiFetch<void>(`/api/branch-employees/${id}`, {
      method: 'DELETE',
      auth: true,
    })
  },

  regeneratePin(id: string) {
    return apiFetch<RegenerateBranchEmployeePinResponse>(
      `/api/branch-employees/${id}/regenerate-pin`,
      { method: 'POST', auth: true },
    )
  },

  verifyPin(payload: VerifyEmployeePinPayload) {
    return apiFetch<VerifyEmployeePinResponse>('/api/branch-employees/verify-pin', {
      method: 'POST',
      auth: true,
      body: JSON.stringify(payload),
    })
  },
}
