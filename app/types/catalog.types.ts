import type { ProductSize } from './order.types';

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
// "estilo" (Forma) es el único catálogo con tamaños aplicables (cliente #5) —
// vacío/undefined significa que aplica para cualquier tamaño.
export type StyleItem = CatalogItem & { applicableSizes?: ProductSize[] };
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
    applicableSizes?: ProductSize[];
}

export type UpdateCatalogPayload = Partial<{
    name: string;
    description: string;
    isActive: boolean;
    price: number;
    applicableSizes: ProductSize[];
}>

export type CreateColorPayload = {
    name: string;
    value: string;
}