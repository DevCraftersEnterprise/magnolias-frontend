import { productsService, getProductImageUrl } from "~/services/products.service";
import type { ProductItem } from "~/types/product.types";
import type { ProductSize } from '~/types/order.types';

export type ExistingReferenceImage = { id: string; imageUrl: string };

export type TierRow = {
    localId: string;
    position: number;
    sizeId: ProductSize | ''; customSize: string;
    colorId: string; breadId: string;
    fillingId: string; frostingId: string;
};

export type OrderProductRow = {
    product: ProductItem;
    qty: number; price: number;
    sizeId: ProductSize | ''; colorId: string; breadId: string;
    fillingId: string; frostingId: string; styleId: string;
    withText: boolean; text: string; textLocation: string;
    mangaStyle: string; mangaNotes: string;
    customSize: string; notes: string;
    withReference: boolean; referenceFiles: File[]; referencePreviews: string[];
    existingReferenceImages: ExistingReferenceImage[];
    discountPercent: number;
    hasTiers: boolean; tiers: TierRow[];
};

export const MIN_TIERS = 2;

/**
 * Mapea un TierRow (estado del formulario) al payload de un piso que espera
 * el backend. Compartido entre crear.vue y editar.vue para no duplicar esta
 * lógica en ambas páginas del wizard.
 */
export function mapTierToPayload(tier: TierRow, index: number) {
    return {
        position: index + 1,
        productSize: tier.sizeId || undefined,
        customSize:
            tier.sizeId === "CUSTOM" ? tier.customSize || undefined : undefined,
        breadTypeId: tier.breadId || undefined,
        fillingId: tier.fillingId || undefined,
        frostingId: tier.frostingId || undefined,
        colorId: tier.colorId || undefined,
    };
}

/**
 * Mapea un OrderProductRow (estado del formulario) al payload de un detalle
 * de pedido que espera el backend, sin incluir `discountPercent` (su regla
 * difiere entre crear.vue y editar.vue - cada página lo agrega aparte).
 * Compartido entre ambas páginas del wizard.
 */
export function buildOrderDetailPayload(row: OrderProductRow) {
    return {
        productId: row.product.id,
        price: row.price,
        quantity: row.qty,
        productSize: row.hasTiers ? undefined : row.sizeId || undefined,
        customSize:
            !row.hasTiers && row.sizeId === "CUSTOM"
                ? row.customSize || undefined
                : undefined,
        hasWriting: row.withText,
        writingText: row.withText && row.text ? row.text : undefined,
        writingLocation:
            row.withText && row.textLocation ? row.textLocation : undefined,
        pipingLocation:
            row.mangaStyle && row.mangaStyle !== "NONE" ? row.mangaStyle : undefined,
        decorationNotes: row.mangaNotes || undefined,
        notes: row.notes || undefined,
        breadTypeId: row.hasTiers ? undefined : row.breadId || undefined,
        colorId: row.hasTiers ? undefined : row.colorId || undefined,
        fillingId: row.hasTiers ? undefined : row.fillingId || undefined,
        frostingId: row.hasTiers ? undefined : row.frostingId || undefined,
        styleId: row.styleId || undefined,
        referenceFiles:
            row.referenceFiles.length > 0 ? row.referenceFiles : undefined,
        tiers: row.hasTiers
            ? row.tiers.map((tier, index) => mapTierToPayload(tier, index))
            : undefined,
    };
}

export const MAX_REFERENCE_IMAGES_PER_ROW = 10;

export const UBICACION_OPTIONS = [
    { value: "TOP", label: "Arriba" },
    { value: "BOTTOM", label: "Abajo" },
    { value: "CENTER", label: "Centro" },
    { value: "FRONT", label: "Frente" },
    { value: "BACK", label: "Atrás" },
    { value: "SIDE", label: "Lado" },
];

// Los valores deben coincidir exactamente con el enum PipingLocation del
// backend (src/common/enums/piping-location.enum.ts); un valor que no
// coincida hace que el backend rechace el pedido en el paso de creación.
export const MANGA_OPTIONS = [
    { value: "NONE", label: "Ninguna" },
    { value: "TOP_BORDER", label: "Borde superior" },
    { value: "BOTTOM_BORDER", label: "Borde inferior" },
    { value: "FULL_BORDER", label: "Borde completo" },
    { value: "CENTER", label: "Centro" },
    { value: "FULL_DESING", label: "Diseño completo" },
];

export function useProductBuilder(colorCatalog: Ref<{ id: string; name: string; value: string }[]>) {
    const orderProducts = ref<OrderProductRow[]>([]);
    const productQuery = ref("");
    const productSearching = ref(false);
    const productResults = ref<ProductItem[]>([]);
    const showProductPanel = ref(false);
    const openColorPicker = ref<string | null>(null);

    let productSearchTimer: ReturnType<typeof setTimeout> | null = null;
    watch(productQuery, (q) => {
        if (productSearchTimer) clearTimeout(productSearchTimer);
        const trimmed = q.trim();
        if (!trimmed) { productResults.value = []; showProductPanel.value = false; return; }
        productSearchTimer = setTimeout(() => {
            productSearching.value = true;
            productsService.getProducts(12, 0, { name: trimmed, includeHidden: true })
                .then((r) => { productResults.value = r.items; showProductPanel.value = true; })
                .catch(() => { productResults.value = []; })
                .finally(() => { productSearching.value = false; });
        }, 400);
    });

    if (typeof window !== "undefined") {
        document.addEventListener("click", () => { openColorPicker.value = null; });
    }

    function colorPickerKey(prefix: string, index: number) { return `${prefix}-${index}`; }
    function pickColor(rowRef: { colorId: string }, colorId: string, _key?: string) {
        rowRef.colorId = colorId;
        openColorPicker.value = null;
    }

    function makeProductRow(p: ProductItem): OrderProductRow {
        return {
            product: p, qty: 1, price: 0,
            sizeId: "", colorId: "", breadId: "",
            fillingId: "", frostingId: "", styleId: "",
            withText: false, text: "", textLocation: "TOP",
            mangaStyle: "", mangaNotes: "", customSize: "", notes: "",
            withReference: false, referenceFiles: [], referencePreviews: [],
            existingReferenceImages: [],
            discountPercent: 0,
            hasTiers: false, tiers: [],
        };
    }

    let tierIdCounter = 0;
    function makeTierRow(position: number): TierRow {
        tierIdCounter++;
        return {
            localId: `tier-${tierIdCounter}`,
            position,
            sizeId: "", customSize: "",
            colorId: "", breadId: "",
            fillingId: "", frostingId: "",
        };
    }

    function addTier(rowIndex: number) {
        const row = orderProducts.value[rowIndex];
        if (!row) return;
        row.tiers.push(makeTierRow(row.tiers.length + 1));
    }

    function removeTier(rowIndex: number, tierIndex: number) {
        const row = orderProducts.value[rowIndex];
        if (!row) return;
        row.tiers.splice(tierIndex, 1);
        row.tiers.forEach((t, i) => { t.position = i + 1; });
    }

    function setHasTiers(rowIndex: number, value: boolean) {
        const row = orderProducts.value[rowIndex];
        if (!row) return;
        row.hasTiers = value;
        if (value) {
            while (row.tiers.length < MIN_TIERS) row.tiers.push(makeTierRow(row.tiers.length + 1));
        } else {
            row.tiers = [];
        }
    }

    function addProduct(p: ProductItem) {
        const existing = orderProducts.value.find((r) => r.product.id === p.id);
        if (existing) { existing.qty++; }
        else { orderProducts.value.push(makeProductRow(p)); }
        productQuery.value = ""; productResults.value = []; showProductPanel.value = false;
    }

    function removeProduct(i: number) {
        const row = orderProducts.value[i];
        row?.referencePreviews.forEach((url) => URL.revokeObjectURL(url));
        orderProducts.value.splice(i, 1);
    }

    // Reference image modal
    const refModal = reactive({ open: false, rowIndex: -1 });
    const refModalRow = computed(() =>
        refModal.rowIndex >= 0 ? (orderProducts.value[refModal.rowIndex] ?? null) : null,
    );
    function openRefModal(i: number) {
        refModal.rowIndex = i;
        refModal.open = true;
    }
    function onRefFileChange(e: Event) {
        const input = e.target as HTMLInputElement;
        const files = input.files;

        if (!files || files.length === 0) return;
        const row = orderProducts.value[refModal.rowIndex];
        if (!row) return;
        const availableSlots = MAX_REFERENCE_IMAGES_PER_ROW - row.referenceFiles.length - row.existingReferenceImages.length;

        Array.from(files).slice(0, availableSlots).forEach((file) => {
            row.referenceFiles.push(file);
            row.referencePreviews.push(URL.createObjectURL(file));
        });
        input.value = "";
    }
    function confirmRefImage() { refModal.open = false; }
    function removeRefImageAt(rowIndex: number, fileIndex: number) {
        const row = orderProducts.value[rowIndex];
        if (!row) return;
        const [url] = row.referencePreviews.splice(fileIndex, 1);
        if (url) URL.revokeObjectURL(url);
        row.referenceFiles.splice(fileIndex, 1);
        if (row.referenceFiles.length === 0) row.withReference = false;
    }
    function removeRefImage(i: number) {
        const row = orderProducts.value[i];
        if (!row) return;
        row.referencePreviews.forEach((url) => URL.revokeObjectURL(url));
        row.referenceFiles = []; row.referencePreviews = []; row.withReference = false;
    }

    function removeExistingReferenceImage(rowIndex: number, imageId: string) {
        const row = orderProducts.value[rowIndex];
        if (!row) return;
        row.existingReferenceImages = row.existingReferenceImages.filter((img) => img.id !== imageId);
        if (row.existingReferenceImages.length === 0 && row.referenceFiles.length === 0) {
            row.withReference = false;
        }
    }


    // Detail modal
    const detailModal = reactive({ open: false, rowIndex: -1 });
    const detailRow = computed(() =>
        detailModal.rowIndex >= 0 ? (orderProducts.value[detailModal.rowIndex] ?? null) : null,
    );
    const detailRowHasDetails = computed(() => {
        const r = detailRow.value;
        if (!r) return false;
        return !!(r.sizeId || r.colorId || r.breadId || r.fillingId ||
            r.frostingId || r.styleId || r.hasTiers || (r.withText && r.text) ||
            (r.mangaStyle && r.mangaStyle !== "NONE") || r.notes ||
            r.referencePreviews.length > 0 || r.existingReferenceImages.length > 0);
    });
    function openDetailModal(i: number) { detailModal.rowIndex = i; detailModal.open = true; }
    function closeDetailModal() { detailModal.open = false; }

    function optionLabel(opts: { value: string; label: string }[], val: string) {
        return opts.find((o) => o.value === val)?.label ?? "—";
    }

    onUnmounted(() => {
        orderProducts.value.forEach((r) => {
            r.referencePreviews.forEach((url) => URL.revokeObjectURL(url));
        });
    });

    return {
        orderProducts, productQuery, productSearching, productResults, showProductPanel,
        openColorPicker, colorPickerKey, pickColor,
        addProduct, removeProduct, makeProductRow,
        addTier, removeTier, setHasTiers, makeTierRow, MIN_TIERS,
        refModal, refModalRow, openRefModal, onRefFileChange, confirmRefImage, removeRefImage, removeRefImageAt, removeExistingReferenceImage,
        detailModal, detailRow, detailRowHasDetails, openDetailModal, closeDetailModal,
        optionLabel, getProductImageUrl,
        UBICACION_OPTIONS, MANGA_OPTIONS, MAX_REFERENCE_IMAGES_PER_ROW,
    };
}
