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
    price?: string;
}

export type BreadTypeItem = CatalogItem;
export type FillingItem = CatalogItem;
export type FrostingItem = CatalogItem;
export type StyleItem = CatalogItem;
export type DecorationItem = CatalogItem;
export type FruitItem = CatalogItem;
export type FlowerItem = CatalogItem & {
    createdAt: string;
    updatedAt: string
}

export type CreateCatalogPayload = {
    name: string;
    description: string;
    price?: number;
}

export type UpdateCatalogPayload = Partial<{
    name: string;
    description: string;
    isActive: boolean;
    price: number;
}>

export type CreateColorPayload = {
    name: string;
    value: string;
}