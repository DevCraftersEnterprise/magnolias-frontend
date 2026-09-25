import type { Ref } from "vue";
import type { OrderDetail, OrderDetailCatalogItem } from "~/types/order.types";

function catalogItemPrice(item?: OrderDetailCatalogItem): number {
    return moneyToNumber(item?.price);
}

/**
 * Suma el precio ACTUAL de los catálogos elegidos en un pedido ya creado
 * (pan, relleno, cobertura, decoración, fruta por línea o por piso, más
 * flores del pedido completo). Es un total de referencia: puede no
 * coincidir con lo que realmente se cobró si el precio del catálogo
 * cambió después de crear el pedido (el pedido no guarda un snapshot
 * histórico por catálogo, solo el precio de línea capturado a mano).
 * No reusa useCatalogPriceSum (wizard): ese composable opera sobre ids +
 * catálogos completos de una sola fila sin pisos, mientras que aquí ya
 * tenemos los objetos de catálogo completos embebidos en la respuesta del
 * pedido, incluyendo pisos y flores.
 */
export function useOrderCatalogPriceTotal(order: Ref<OrderDetail | null>) {
    return computed(() => {
        if (!order.value) return 0;

        const detailsTotal = order.value.details.reduce((sum, detail) => {
            const extras =
                catalogItemPrice(detail.decoration) +
                catalogItemPrice(detail.fruit);
            if (detail.tiers && detail.tiers.length > 0) {
                return (
                    sum +
                    extras +
                    detail.tiers.reduce(
                        (tierSum, tier) =>
                            tierSum +
                            catalogItemPrice(tier.breadType) +
                            catalogItemPrice(tier.filling) +
                            catalogItemPrice(tier.frosting),
                        0,
                    )
                );
            }
            return (
                sum +
                catalogItemPrice(detail.breadType) +
                catalogItemPrice(detail.filling) +
                catalogItemPrice(detail.frosting) +
                catalogItemPrice(detail.decoration) +
                catalogItemPrice(detail.fruit)
            );
        }, 0);

        const flowersTotal = (order.value.orderFlowers ?? []).reduce(
            (sum, f) => sum + moneyToNumber(f.flower?.price) * (f.quantity ?? 1),
            0,
        );

        return detailsTotal + flowersTotal;
    });
}
