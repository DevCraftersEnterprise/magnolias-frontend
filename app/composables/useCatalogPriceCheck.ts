import type { Ref } from "vue";

type PricedCatalogItem = { id: string; price?: string };
type PricedRow = {
    breadId?: string;
    fillingId?: string;
    frostingId?: string;
    decorationId?: string;
    fruitId?: string;
    hasTiers?: boolean;
    tiers?: { breadId?: string; fillingId?: string; frostingId?: string }[];
};

/**
 * Suma los precios de catálogo elegidos en una línea de producto (relleno,
 * frosting, tipo de pan, decoración, fruta), para verificar/ajustar el
 * precio capturado manualmente en el paso 4. Compartido entre crear.vue y
 * editar.vue para no duplicar este cálculo en ambas páginas del wizard.
 * Forma (Style) no se incluye: el cliente decidió que forma y tamaño no
 * deben manejar precio.
 */
export function useCatalogPriceSum(
    row: Ref<PricedRow | null>,
    catalogs: {
        breadTypes: Ref<PricedCatalogItem[]>;
        fillings: Ref<PricedCatalogItem[]>;
        frostings: Ref<PricedCatalogItem[]>;
        decorations: Ref<PricedCatalogItem[]>;
        fruits: Ref<PricedCatalogItem[]>;
    },
) {
    return computed(() => {
        const r = row.value;
        if (!r) return 0;
        const extras =
            catalogPrice(catalogs.decorations.value, r.decorationId ?? "") +
            catalogPrice(catalogs.fruits.value, r.fruitId ?? "");
        if (r.hasTiers) {
            return (
                (r.tiers ?? []).reduce(
                    (sum, t) =>
                        sum +
                        catalogPrice(catalogs.breadTypes.value, t.breadId ?? "") +
                        catalogPrice(catalogs.fillings.value, t.fillingId ?? "") +
                        catalogPrice(catalogs.frostings.value, t.frostingId ?? ""),
                    0,
                ) + extras
            );
        }
        return (
            catalogPrice(catalogs.breadTypes.value, r.breadId ?? "") +
            catalogPrice(catalogs.fillings.value, r.fillingId ?? "") +
            catalogPrice(catalogs.frostings.value, r.frostingId ?? "") +
            extras
        );
    });
}
