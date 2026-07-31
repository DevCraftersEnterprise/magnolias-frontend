export type OrderStatus = 'CREATED' | 'IN PROCESS' | 'DONE' | 'DELIVERED' | 'CANCELED';
export type OrderType = 'DOMICILIO' | 'EVENTO' | 'VITRINA' | 'PERSONALIZADO' | 'FLOR';
export type ProductSize = '10P' | '15P' | '20P' | '25P' | '30P' | '40P' | '50P' | 'CUSTOM';

export type OrderDeliveryAddress = {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    postalCode?: string | null;
    interphoneCode?: string | null;
    betweenStreets?: string | null;
    reference?: string | null;
    deliveryNotes?: string | null;
    receiverName?: string;
    receiverPhone?: string;
}

export type OrderCustomerAddress = {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
}

export type OrderAuditUser = {
    name: string;
    lastname: string;
}

export type OrderCustomer = {
    id: string;
    fullName: string;
    phone?: string | null;
    alternativePhone?: string | null;
    email?: string | null;
    notes?: string | null;
    address?: OrderCustomerAddress;
}

export type OrderAssignedBaker = {
    id: string;
    name: string;
    lastname: string;
    role?: string;
    area?: string;
}

export type OrderAssignment = {
    id: string;
    baker: OrderAssignedBaker;
    assignedDate: string;
    notes?: string | null;
}

export type OrderItem = {
    id: string;
    orderCode: string;
    orderType?: OrderType;
    deliveryDate: string;
    deliveryTime?: string;
    totalAmount: string;
    advancePayment?: string;
    remainingBalance?: string;
    status: OrderStatus;
    customer?: OrderCustomer;
    deliveryAddress?: OrderDeliveryAddress;
    createdBy?: OrderAuditUser;
    updatedBy?: OrderAuditUser;
    reference?: string | string[];
    assignments?: OrderAssignment[];
    createdAt: string;
    updatedAt: string;
}

export type OrdersResponse = {
    items: OrderItem[];
    total: number;
    pagination: {
        limit: number;
        offset: number;
        currentPage: number;
        totalPages: number;
    };
}

export type OrderFilters = {
    name?: string;
    clientPhone?: string;
    orderStatus?: OrderStatus | '';
    orderDate?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

// ─── Order detail types (GET /api/orders/{term}) ───────────────────────────
export type OrderDetailProduct = {
    id: string;
    name: string;
    description?: string | null;
    isFavorite?: boolean;
    isActive?: boolean;
    pictures?: { id: string; imageUrl: string; isActive: boolean }[];
}

export type OrderDetailCatalogItem = {
    id: string;
    name: string;
} | null

export type OrderDetailItem = {
    id: string;
    price: string;
    quantity: number;
    productSize?: ProductSize | null;
    customSize?: string | null;
    hasWriting?: boolean;
    writingText?: string | null;
    writingLocation?: string | null;
    pipingLocation?: string | null;
    decorationNotes?: string | null;
    notes?: string | null;
    referenceImages?: { id: string; imageUrl: string }[];
    isActive?: boolean;
    product?: OrderDetailProduct | null;
    color?: OrderDetailCatalogItem;
    breadType?: OrderDetailCatalogItem;
    filling?: OrderDetailCatalogItem;
    frosting?: OrderDetailCatalogItem;
    style?: OrderDetailCatalogItem;
    discountPercent?: number | string | null;
    discountAuthorizedBy?: { id: string; name: string; lastname: string } | null;
    discountAuthorizedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export type OrderDetailCustomer = {
    id: string;
    fullName: string;
    phone?: string | null;
    alternativePhone?: string | null;
    email?: string | null;
    notes?: string | null;
    isActive?: boolean;
    address?: OrderCustomerAddress;
}

export type OrderDetailDeliveryAddress = {
    id?: string;
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    postalCode?: string | null;
    interphoneCode?: string | null;
    betweenStreets?: string | null;
    reference?: string | null;
    deliveryNotes?: string | null;
    receiverName?: string;
    receiverPhone?: string;
    createdAt?: string;
}

export type OrderDetailBranch = {
    id: string;
    name: string;
    address?: string;
    isActive?: boolean;
}

export type OrderDetailAuditUser = {
    id: string;
    name: string;
    lastname: string;
    username?: string;
    role?: string;
}

export type OrderPayment = {
    id: string;
    paidAmount: string;
    createdAt: string;
}

export type OrderDetail = {
    id: string;
    orderType: OrderType;
    orderCode: string;
    deliveryRound?: string | null;
    deliveryDate: string;
    deliveryTime?: string | null;
    readyTime?: string | null;
    eventTime?: string | null;
    setupTime?: string | null;
    branchDepartureTime?: string | null;
    collectionDateTime?: string | null;
    setupPersonName?: string | null;
    eventServices?: string[] | null;
    guestCount?: number | null;
    totalAmount: string;
    advancePayment?: string;
    remainingBalance?: string;
    paidAmount?: string;
    dessertsTotal?: string;
    setupServiceCost?: string;
    hasPhotoReference?: boolean;
    ticketNumber?: string | null;
    settlementTicketNumber?: string | null;
    paymentMethod?: string | null;
    transferAccount?: string | null;
    requiresInvoice?: boolean;
    isCustomerPickup?: boolean;
    settlementDate?: string | null;
    settlementTotal?: string;
    status: OrderStatus;
    deliveryAddress?: OrderDetailDeliveryAddress;
    customer?: OrderDetailCustomer;
    branch?: OrderDetailBranch;
    createdBy?: OrderDetailAuditUser;
    updatedBy?: OrderDetailAuditUser;
    createdAt: string;
    updatedAt: string;
    details: OrderDetailItem[];
    orderFlowers: any[];
    payments?: OrderPayment[];
}

export type UpdateOrderDetailPayload = {
    productId: string;
    price: number;
    quantity: number;
    productSize?: ProductSize;
    customSize?: string;
    hasWriting: boolean;
    writingText?: string;
    writingLocation?: string;
    pipingLocation?: string;
    decorationNotes?: string;
    notes?: string;
    breadTypeId?: string;
    colorId?: string;
    fillingId?: string;
    frostingId?: string;
    styleId?: string;
    referenceFiles?: File[];
    discountPercent?: number;
}

export type UpdateOrderPayload = {
    id: string;
    orderType?: OrderType;
    customerId?: string;
    branchId?: string;
    advancePayment?: number;
    payment?: number;
    paymentMethod?: string;
    transferAccount?: string;
    ticketNumber?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    readyTime?: string;
    deliveryRound?: string;
    collectionDateTime?: string;
    eventTime?: string;
    setupTime?: string;
    branchDepartureTime?: string;
    setupPersonName?: string;
    eventServices?: string[];
    guestCount?: number;
    dessertsTotal?: number;
    setupServiceCost?: number;
    hasPhotoReference?: boolean;
    requiresInvoice?: boolean;
    isCustomerPickup?: boolean;
    deliveryAddress?: CreateOrderDeliveryAddress;
    details?: UpdateOrderDetailPayload[];
    flowers?: CreateOrderFlower[];
    discountAuthToken?: string;
}


export type CreateOrderDetail = {
    productId: string;
    price: number;
    quantity: number;
    productSize?: ProductSize;
    customSize?: string;
    hasWriting: boolean;
    writingText?: string;
    writingLocation?: string;
    pipingLocation?: string;
    decorationNotes?: string;
    notes?: string;
    breadTypeId?: string;
    colorId?: string;
    fillingId?: string;
    frostingId?: string;
    styleId?: string;
    referenceFiles?: File[];
    discountPercent?: number;
}

export type CreateOrderFlower = {
    flowerId: string;
    colorId?: string;
    quantity: number;
    notes?: string;
}

export type CreateOrderDeliveryAddress = {
    useCustomerAddress: boolean;
    useCommonAddress?: boolean;
    commonAddressId?: string;
    saveAsCommonAddress?: boolean;
    commonAddressName?: string;
    newAddress?: {
        street: string;
        number: string;
        neighborhood: string;
        city?: string;
        postalCode?: string;
        betweenStreets?: string;
        interphoneCode?: string;
        reference?: string;
    };
    betweenStreets?: string;
    interphoneCode?: string;
    reference?: string;
    deliveryNotes?: string;
    receiverName?: string;
    receiverPhone?: string;
}

export type CreateOrderPayload = {
    orderType: OrderType;
    customerId: string;
    branchId: string;
    advancePayment: number;
    paymentMethod?: string;
    ticketNumber?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    readyTime?: string;
    deliveryRound?: string;
    // VITRINA / FLOR-vitrina pickup
    collectionDateTime?: string;
    // EVENTO
    eventTime?: string;
    setupTime?: string;
    branchDepartureTime?: string;
    setupPersonName?: string;
    eventServices?: string[];
    guestCount?: number;
    dessertsTotal?: number;
    setupServiceCost?: number;
    // misc
    hasPhotoReference?: boolean;
    requiresInvoice?: boolean;
    isCustomerPickup?: boolean;
    transferAccount?: string;
    deliveryAddress?: CreateOrderDeliveryAddress;
    details: CreateOrderDetail[];
    flowers?: CreateOrderFlower[];
    discountAuthToken?: string;
}