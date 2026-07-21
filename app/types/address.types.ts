export type CommonAddress = {
    id: string;
    name: string;
    street: string;
    number: string;
    neighborhood: string;
    city?: string | null;
    postalCode?: string | null;
    interphoneCode?: string | null;
    betweenStreets?: string | null;
    reference?: string | null;
    notes?: string | null;
    usageCount?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type CreateCommonAddressPayload = {
    name: string;
    street: string;
    number: string;
    neighborhood: string;
    city?: string;
    postalCode?: string;
    interphoneCode?: string;
    betweenStreets?: string;
    reference?: string;
    notes?: string;
}