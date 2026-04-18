export type ProductPicture = {
    id: string;
    imageUrl: string;
    isActive: boolean;
}

export type ProductItem = {
    id: string;
    name: string;
    description: string;
    isFavorite: boolean;
    isActive: boolean;
    category: { id: string; };
    createdAt: string;
    updatedAt: string;
    pictures: ProductPicture[];
}

export type CategoryItem = {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    products: ProductItem[];
}

export type CreateCategoryPayload = {
    name: string;
    description: string;
}

export type PatchCategoryPayload = Partial<{
    name: string;
    description: string;
    isActive: boolean;
}>

export type CategoryMini = { id: string; name: string; }

export type ProductsResponse = {
    items: ProductItem[];
    total: number;
    pagination: {
        limit: number;
        offset: number;
        totalPages: number;
        currentPage: number;
    };
}

export type ProductsFilters = Partial<{
    name: string;
    categoryId: string;
    isActive: boolean;
    isFavorite: boolean;
}>

export type CreateProductPayload = {
    name: string;
    description: string;
    isFavorite: boolean;
    categoryId: string;
}

export type UploadProductPicturesPayload = {
    id: string;
    name: string;
    description: string;
    isFavorite: boolean;
    categoryId: string;
    isActive: boolean;
    files: File[];
}

export type PatchProductPayload = {
    id: string;
    name: string;
    description: string;
    isFavorite: boolean;
    categoryId: string;
    isActive: boolean;
}

export type UpdateFavoritePayload = {
    name: string;
    description: string;
    isFavorite: boolean;
    isActive: boolean;
    categoryId: string;
}