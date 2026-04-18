import { apiFetch } from '~/services/api.client'
import type { BranchCreatePayload, BranchPhonesPayload, BranchPhonesResponse, BranchPhonesUpdatePayload, BranchResponse, BranchUpdatePayload } from '~/types/branch.types';

export const branchesService = {
    getBranches() {
        return apiFetch<BranchResponse[]>('/api/branches', {
            method: 'GET'
        });
    },

    createBranch(payload: BranchCreatePayload) {
        return apiFetch<BranchResponse>('/api/branches', {
            method: 'POST',
            body: payload,
        });
    },

    updateBranch(payload: BranchUpdatePayload) {
        return apiFetch<BranchResponse>('/api/branches', {
            method: 'PATCH',
            body: payload,
        });
    },

    deleteBranch(payload: BranchUpdatePayload) {
        return apiFetch<BranchResponse>('/api/branches', {
            method: 'DELETE',
            body: payload,
        });
    },

    addBranchPhones(branchId: string, payload: BranchPhonesPayload) {
        return apiFetch<BranchPhonesResponse>(`/api/branches/phones/${branchId}`, {
            method: 'POST',
            body: payload,
        });
    },

    updateBranchPhones(payload: BranchPhonesUpdatePayload) {
        return apiFetch<BranchPhonesResponse>('/api/branches/phones', {
            method: 'PATCH',
            body: payload,
        });
    }
}