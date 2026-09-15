import { moneyToNumber } from "./currency";

/** Precio del elemento de catálogo elegido, para verificar el total en el paso 4. */
export function catalogPrice(arr: { id: string; price?: string }[], id: string): number {
    return moneyToNumber(arr.find(x => x.id === id)?.price);
}

type SizedStyle = { id: string; applicableSizes?: string[] };

/**
 * Cliente #5: forma y tamaño relacionados. Filtra el catálogo de formas a
 * las compatibles con el tamaño elegido (una forma sin `applicableSizes`
 * aplica para cualquier tamaño). Compartido entre crear.vue y editar.vue.
 */
export function filterStylesForSize<T extends SizedStyle>(styles: T[], sizeId: string): T[] {
    if (!sizeId) return styles;
    return styles.filter(
        (s) => !s.applicableSizes || s.applicableSizes.length === 0 || s.applicableSizes.includes(sizeId),
    );
}

/** Si la forma elegida ya no es compatible con el nuevo tamaño, la limpia. */
export function resetIncompatibleStyle(
    row: { sizeId: string; styleId: string },
    styles: SizedStyle[],
): void {
    if (row.styleId && !filterStylesForSize(styles, row.sizeId).some((s) => s.id === row.styleId)) {
        row.styleId = "";
    }
}
