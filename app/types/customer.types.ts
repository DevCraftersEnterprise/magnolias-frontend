export type CustomerAddress = {
    id: string;
    street: string | null;
    number: string | null;
    neighborhood: string | null;
    city: string | null;
    postalCode: string | null;
    interphoneCode: string | null;
    betweenStreets: string | null;
    reference: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

export type CustomerItem = {
    id: string;
    fullName: string;
    phone: string;
    alternativePhone: string | null;
    email: string | null;
    notes: string | null;
    isActive: boolean;
    address: CustomerAddress | null;
    createdAt: string;
    updatedAt: string;
}

export type CustomersResponse = {
    items: CustomerItem[];
    total: number;
    pagination: { limit: number; offset: number; totalPages: number; currentPage: number };
}

export type CreateCustomerAddress = {
    street: string;
    number: string;
    neighborhood: string;
    city?: string | null;
    postalCode?: string | null;
    interphoneCode?: string | null;
    betweenStreets?: string | null;
    reference?: string | null;
    notes?: string | null;
}

export type CreateCustomerRequest = {
    fullName: string;
    phone: string;
    alternativePhone?: string | null;
    email?: string | null;
    address?: CreateCustomerAddress | null;
    notes?: string | null;
}

export type UpdateCustomerRequest = {
    fullName?: string;
    phone?: string;
    alternativePhone?: string | null;
    email?: string | null;
    address?: CreateCustomerAddress | null;
    notes?: string | null;
    isActive?: boolean;
}