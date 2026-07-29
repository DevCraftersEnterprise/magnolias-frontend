import { productsService, getProductImageUrl } from "~/services/products.service";
import type { ProductItem } from "~/types/product.types";
import type { ProductSize } from '~/types/order.types';

export type ExistingReferenceImage = { id: string; imageUrl: string };

export type OrderProductRow = {
    product: ProductItem;
    qty: number; price: number;
    sizeId: ProductSize | ''; colorId: string; breadId: string;
    flavorId: string; fillingId: string; frostingId: string; styleId: string;
    withText: boolean; text: string; textLocation: string;
    mangaStyle: string; mangaNotes: string;
    customSize: string; notes: string;
    withReference: boolean; referenceFiles: File[]; referencePreviews: string[];
    existingReferenceImages: ExistingReferenceImage[];
};

export const MAX_REFERENCE_IMAGES_PER_ROW = 10;

export const UBICACION_OPTIONS = [
    { value: "TOP", label: "Arriba" },
    { value: "BOTTOM", label: "Abajo" },
    { value: "CENTER", label: "Centro" },
    { value: "FRONT", label: "Frente" },
    { value: "BACK", label: "Atrás" },
    { value: "SIDE", label: "Lado" },
];

export const MANGA_OPTIONS = [
    { value: "NONE", label: "Ninguna" },
    { value: "TOP", label: "Arriba" },
    { value: "BOTTOM", label: "Abajo" },
    { value: "BOTH_BORDERS", label: "Ambos bordes" },
    { value: "FULL", label: "Completa" },
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
            sizeId: "", colorId: "", breadId: "", flavorId: "",
            fillingId: "", frostingId: "", styleId: "",
            withText: false, text: "", textLocation: "TOP",
            mangaStyle: "", mangaNotes: "", customSize: "", notes: "",
            withReference: false, referenceFiles: [], referencePreviews: [],
            existingReferenceImages: [],
        };
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
        return !!(r.sizeId || r.colorId || r.breadId || r.flavorId || r.fillingId ||
            r.frostingId || r.styleId || (r.withText && r.text) ||
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
        refModal, refModalRow, openRefModal, onRefFileChange, confirmRefImage, removeRefImage, removeRefImageAt, removeExistingReferenceImage,
        detailModal, detailRow, detailRowHasDetails, openDetailModal, closeDetailModal,
        optionLabel, getProductImageUrl,
        UBICACION_OPTIONS, MANGA_OPTIONS, MAX_REFERENCE_IMAGES_PER_ROW,
    };
}
