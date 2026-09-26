import { describe, expect, it, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'

const toastMock = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))
vi.mock('vue-toastification', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-toastification')>()
    return { ...actual, useToast: () => toastMock }
})

import { useDeliveryDateTabs } from './useDeliveryDateTabs'
import { isoDate } from '~/utils/date'

type Item = { id: string; deliveryDate: string }

// Usa el isoDate real (fecha local, ver utils/date.ts) para que el offset
// esperado coincida exactamente con el que calcula el composable.
function isoOffset(days: number): string {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return isoDate(d)
}

describe('useDeliveryDateTabs', () => {
    beforeEach(() => {
        toastMock.error.mockReset()
    })

    it('separa los items de mañana y pasado mañana', () => {
        const items = ref<Item[]>([
            { id: '1', deliveryDate: `${isoOffset(1)}T10:00:00Z` },
            { id: '2', deliveryDate: `${isoOffset(2)}T10:00:00Z` },
            { id: '3', deliveryDate: `${isoOffset(5)}T10:00:00Z` },
        ])

        const { tomorrowItems, dayAfterItems } = useDeliveryDateTabs(
            items,
            (i) => i.deliveryDate,
        )

        expect(tomorrowItems.value.map((i) => i.id)).toEqual(['1'])
        expect(dayAfterItems.value.map((i) => i.id)).toEqual(['2'])
    })

    it('clasifica por día LOCAL: ahora+24h cae en "mañana" sin importar la hora ni la zona horaria (bug de la tarde/noche)', () => {
        const items = ref<Item[]>([
            { id: '1', deliveryDate: new Date(Date.now() + 86400000).toISOString() },
            { id: '2', deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString() },
        ])

        const { tomorrowItems, dayAfterItems } = useDeliveryDateTabs(
            items,
            (i) => i.deliveryDate,
        )

        expect(tomorrowItems.value.map((i) => i.id)).toEqual(['1'])
        expect(dayAfterItems.value.map((i) => i.id)).toEqual(['2'])
    })

    it('acepta fechas sin hora (YYYY-MM-DD) tal cual', () => {
        const items = ref<Item[]>([{ id: '1', deliveryDate: isoOffset(1) }])

        const { tomorrowItems } = useDeliveryDateTabs(items, (i) => i.deliveryDate)

        expect(tomorrowItems.value.map((i) => i.id)).toEqual(['1'])
    })

    it('activeItems refleja la pestaña activa', () => {
        const items = ref<Item[]>([
            { id: '1', deliveryDate: `${isoOffset(1)}T10:00:00Z` },
            { id: '2', deliveryDate: `${isoOffset(2)}T10:00:00Z` },
        ])

        const { tab, activeItems } = useDeliveryDateTabs(
            items,
            (i) => i.deliveryDate,
        )

        expect(activeItems.value.map((i) => i.id)).toEqual(['1'])

        tab.value = 'dayAfter'
        expect(activeItems.value.map((i) => i.id)).toEqual(['2'])

        tab.value = 'all'
        expect(activeItems.value.map((i) => i.id)).toEqual(['1', '2'])
    })

    it('filtra por rango de fechas', () => {
        const items = ref<Item[]>([
            { id: '1', deliveryDate: '2026-01-01T10:00:00Z' },
            { id: '2', deliveryDate: '2026-01-10T10:00:00Z' },
            { id: '3', deliveryDate: '2026-01-20T10:00:00Z' },
        ])

        const { tab, rangeFrom, rangeTo, rangeItems, activeItems } =
            useDeliveryDateTabs(items, (i) => i.deliveryDate)

        tab.value = 'range'
        rangeFrom.value = '2026-01-05'
        rangeTo.value = '2026-01-15'

        expect(rangeItems.value.map((i) => i.id)).toEqual(['2'])
        expect(activeItems.value.map((i) => i.id)).toEqual(['2'])
    })

    it('avisa por toast y vacía rangeItems si la fecha "hasta" es menor que "desde"', async () => {
        const items = ref<Item[]>([{ id: '1', deliveryDate: '2026-01-01T10:00:00Z' }])
        const { rangeFrom, rangeTo, rangeItems } = useDeliveryDateTabs(
            items,
            (i) => i.deliveryDate,
        )

        rangeFrom.value = '2026-01-10'
        rangeTo.value = '2026-01-05'
        await nextTick()

        expect(rangeItems.value).toEqual([])
        expect(toastMock.error).toHaveBeenCalledWith(
            'La fecha de término no puede ser menor a la fecha de inicio.',
        )
    })

    it('rangeItems queda vacío si no se ha elegido ninguna fecha', () => {
        const items = ref<Item[]>([{ id: '1', deliveryDate: '2026-01-01T10:00:00Z' }])
        const { rangeItems } = useDeliveryDateTabs(items, (i) => i.deliveryDate)

        expect(rangeItems.value).toEqual([])
    })
})
