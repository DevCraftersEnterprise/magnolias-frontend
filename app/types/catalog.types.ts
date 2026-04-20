export type ColorItem = {
    id: string;
    value: string;
    name: string;
    isActive: boolean;
}

export type BreadTypeItem = { id: string; name: string; description: string; isActive: boolean }
export type FillingItem = { id: string; name: string; description: string; isActive: boolean }
export type FlavorItem = { id: string; name: string; description: string; isActive: boolean }
export type FrostingItem = { id: string; name: string; description: string; isActive: boolean }
export type StyleItem = { id: string; name: string; description: string; isActive: boolean }
export type FlowerItem = { id: string; name: string; description: string; isActive: boolean; createdAt: string; updatedAt: string }

export type CreateCatalogPayload = {
    name: string;
    description: string;
}

export type UpdateCatalogPayload = Partial<{
    name: string;
    description: string;
    isActive: boolean;
}>

export type CreateColorPayload = {
    name: string;
    value: string;
}