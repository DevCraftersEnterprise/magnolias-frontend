import { apiFetch } from '~/services/api.client'

export type BranchResponse = {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    phones: {
        id: string;
        phone1: string;
        phone2: string | null;
        whatsapp: string | null;
    }
}

export type BranchCreatePayload = {
    name: string;
    address: string;
}

export type BranchUpdatePayload = {
    id: string;
    name: string;
    address: string;
    isActive: boolean;
}

export type BranchPhonesPayload = {
    phone1: string;
    phone2?: string | null;
    whatsapp?: string | null;
}

export type BranchPhonesUpdatePayload = {
    id: string;
    phone1: string;
    phone2?: string | null;
    whatsapp?: string | null;
}

export type BranchPhonesResponse = {
    id: string;
    phone1: string;
    phone2: string | null;
    whatsapp: string | null;
    createdAt: string;
    updatedAt: string;
}

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