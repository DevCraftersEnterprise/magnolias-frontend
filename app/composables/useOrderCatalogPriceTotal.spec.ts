import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useOrderCatalogPriceTotal } from './useOrderCatalogPriceTotal'
import type { OrderDetail } from '~/types/order.types'

function order(overrides: Partial<OrderDetail> = {}): OrderDetail {
    return {
        details: [],
        orderFlowers: [],
        ...overrides,
    } as unknown as OrderDetail
}

describe('useOrderCatalogPriceTotal', () => {
    it('retorna 0 si el pedido es null', () => {
        const total = useOrderCatalogPriceTotal(ref(null))

        expect(total.value).toBe(0)
    })

    it('suma pan, relleno, cobertura, decoración y fruta de una línea sin pisos', () => {
        const o = order({
            details: [
                {
                    id: 'd1',
                    breadType: { id: 'bt-1', name: 'Chocolate', price: '$110.00' },
                    filling: { id: 'fi-1', name: 'Cajeta', price: '$50.00' },
                    frosting: { id: 'fr-1', name: 'Crema', price: '$30.00' },
                    decoration: { id: 'de-1', name: 'Velas', price: '$5.00' },
                    fruit: { id: 'fu-1', name: 'Fresa', price: '$15.00' },
                } as never,
            ],
        })

        const total = useOrderCatalogPriceTotal(ref(o))

        expect(total.value).toBe(210)
    })

    it('suma pan, relleno y cobertura de cada piso cuando la línea tiene tiers', () => {
        const o = order({
            details: [
                {
                    id: 'd1',
                    tiers: [
                        {
                            position: 1,
                            breadType: { id: 'bt-1', name: 'Chocolate', price: '$110.00' },
                            filling: { id: 'fi-1', name: 'Cajeta', price: '$50.00' },
                            frosting: { id: 'fr-1', name: 'Crema', price: '$30.00' },
                        },
                        {
                            position: 2,
                            breadType: { id: 'bt-2', name: 'Vainilla', price: '$100.00' },
                            filling: { id: 'fi-2', name: 'Nuez', price: '$40.00' },
                            frosting: { id: 'fr-2', name: 'Chantilly', price: '$20.00' },
                        },
                    ],
                } as never,
            ],
        })

        const total = useOrderCatalogPriceTotal(ref(o))

        expect(total.value).toBe(350)
    })

    it('con pisos también suma decoración y fruta de la línea', () => {
        const o = order({
            details: [
                {
                    id: 'd1',
                    decoration: { id: 'de-1', name: 'Velas', price: '$5.00' },
                    fruit: { id: 'fu-1', name: 'Cerezas', price: '$15.00' },
                    tiers: [
                        { position: 1, breadType: { id: 'b', name: 'Red Velvet', price: '$150.00' } },
                    ],
                } as never,
            ],
        })

        expect(useOrderCatalogPriceTotal(ref(o)).value).toBe(170)
    })

    it('incluye las flores del pedido, multiplicadas por su cantidad', () => {
        const o = order({
            orderFlowers: [
                { flower: { id: 'fl-1', name: 'Margaritas', price: '$15.00' }, quantity: 3 },
            ],
        })

        const total = useOrderCatalogPriceTotal(ref(o))

        expect(total.value).toBe(45)
    })

    it('ignora catálogos sin price (ej. Forma, que no debe manejar precio)', () => {
        const o = order({
            details: [
                {
                    id: 'd1',
                    style: { id: 'st-1', name: 'Redondo' },
                    breadType: { id: 'bt-1', name: 'Chocolate', price: '$110.00' },
                } as never,
            ],
        })

        const total = useOrderCatalogPriceTotal(ref(o))

        expect(total.value).toBe(110)
    })
})
