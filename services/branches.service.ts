import { apiFetch } from '~/services/api.client'

export type BranchResponse = {
    id: string;
    name: string;
    address: string;
    isActive: boolean;
    phones: {
        id: string;
        phone1: string;
        phone2: string | null;
        whatsapp: string | null;
    }
}

export const branchesService = {
    getBranches() {
        return apiFetch<BranchResponse[]>('/api/branches', {
            method: 'GET'
        });
    }
}