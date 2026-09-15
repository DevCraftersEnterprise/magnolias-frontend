import type { Ref } from "vue";

type PricedCatalogItem = { id: string; price?: string };
type PricedRow = {
    breadId?: string;
    fillingId?: string;
    frostingId?: string;
    styleId?: string;
};

/**
 * Suma los precios de catálogo elegidos en una línea de producto (relleno,
 * frosting, forma, tipo de pan), para verificar/ajustar el precio capturado
 * manualmente en el paso 4. Compartido entre crear.vue y editar.vue para no
 * duplicar este cálculo en ambas páginas del wizard.
 */
export function useCatalogPriceSum(
    row: Ref<PricedRow | null>,
    catalogs: {
        breadTypes: Ref<PricedCatalogItem[]>;
        fillings: Ref<PricedCatalogItem[]>;
        frostings: Ref<PricedCatalogItem[]>;
        styles: Ref<PricedCatalogItem[]>;
    },
) {
    return computed(() => {
        const r = row.value;
        if (!r) return 0;
        return (
            catalogPrice(catalogs.breadTypes.value, r.breadId ?? "") +
            catalogPrice(catalogs.fillings.value, r.fillingId ?? "") +
            catalogPrice(catalogs.frostings.value, r.frostingId ?? "") +
            catalogPrice(catalogs.styles.value, r.styleId ?? "")
        );
    });
}
