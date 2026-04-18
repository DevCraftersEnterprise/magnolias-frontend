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
    };
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