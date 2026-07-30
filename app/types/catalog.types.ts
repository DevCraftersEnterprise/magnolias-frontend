export type ColorItem = {
    id: string;
    value: string;
    name: string;
    isActive: boolean;
}

export type CatalogItem = {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
}

export type BreadTypeItem = CatalogItem;
export type FillingItem = CatalogItem;
export type FrostingItem = CatalogItem;
export type StyleItem = CatalogItem;
export type FlowerItem = CatalogItem & {
    createdAt: string;
    updatedAt: string
}

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