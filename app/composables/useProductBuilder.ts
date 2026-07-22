import { productsService, getProductImageUrl } from "~/services/products.service";
import type { ProductItem } from "~/types/product.types";
import type { ProductSize } from '~/types/order.types';

export type OrderProductRow = {
    product: ProductItem;
    qty: number; price: number;
    sizeId: ProductSize | ''; colorId: string; breadId: string;
    flavorId: string; fillingId: string; frostingId: string; styleId: string;
    withText: boolean; text: string; textLocation: string;
    mangaStyle: string; mangaNotes: string;
    customSize: string; notes: string;
    withReference: boolean; referenceFile: File | null; referencePreview: string;
};

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
            productsService.getProducts(12, 0, { name: trimmed })
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
            withReference: false, referenceFile: null, referencePreview: "",
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
        if (row?.referencePreview && row.referenceFile) URL.revokeObjectURL(row.referencePreview);
        orderProducts.value.splice(i, 1);
    }

    // Reference image modal
    const refModal = reactive({ open: false, rowIndex: -1, preview: "" });
    function openRefModal(i: number) {
        refModal.rowIndex = i;
        refModal.preview = orderProducts.value[i]?.referencePreview ?? "";
        refModal.open = true;
    }
    function onRefFileChange(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const row = orderProducts.value[refModal.rowIndex];
        if (!row) return;
        if (row.referencePreview && row.referenceFile) URL.revokeObjectURL(row.referencePreview);
        row.referenceFile = file;
        row.referencePreview = URL.createObjectURL(file);
        refModal.preview = row.referencePreview;
    }
    function confirmRefImage() { refModal.open = false; }
    function removeRefImage(i: number) {
        const row = orderProducts.value[i];
        if (!row) return;
        if (row.referencePreview && row.referenceFile) URL.revokeObjectURL(row.referencePreview);
        row.referenceFile = null; row.referencePreview = ""; row.withReference = false;
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
            (r.mangaStyle && r.mangaStyle !== "NONE") || r.notes || r.referencePreview);
    });
    function openDetailModal(i: number) { detailModal.rowIndex = i; detailModal.open = true; }
    function closeDetailModal() { detailModal.open = false; }

    function optionLabel(opts: { value: string; label: string }[], val: string) {
        return opts.find((o) => o.value === val)?.label ?? "—";
    }

    onUnmounted(() => {
        orderProducts.value.forEach((r) => {
            if (r.referenceFile && r.referencePreview) URL.revokeObjectURL(r.referencePreview);
        });
    });

    return {
        orderProducts, productQuery, productSearching, productResults, showProductPanel,
        openColorPicker, colorPickerKey, pickColor,
        addProduct, removeProduct, makeProductRow,
        refModal, openRefModal, onRefFileChange, confirmRefImage, removeRefImage,
        detailModal, detailRow, detailRowHasDetails, openDetailModal, closeDetailModal,
        optionLabel, getProductImageUrl,
        UBICACION_OPTIONS, MANGA_OPTIONS,
    };
}