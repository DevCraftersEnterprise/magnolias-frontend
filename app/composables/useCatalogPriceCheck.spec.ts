import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useCatalogPriceSum } from './useCatalogPriceCheck'

function catalogs() {
    return {
        breadTypes: ref([{ id: 'bt-1', price: '$10.00' }]),
        fillings: ref([{ id: 'fi-1', price: '$20.00' }]),
        frostings: ref([{ id: 'fr-1', price: '$5.00' }]),
        decorations: ref([{ id: 'de-1', price: '$8.00' }]),
        fruits: ref([{ id: 'fu-1', price: '$12.00' }]),
    }
}

describe('useCatalogPriceSum', () => {
    it('retorna 0 cuando no hay fila seleccionada', () => {
        const row = ref(null)
        const sum = useCatalogPriceSum(row, catalogs())

        expect(sum.value).toBe(0)
    })

    it('suma los precios de los catálogos elegidos en la fila (Forma no aporta precio)', () => {
        const row = ref({
            breadId: 'bt-1',
            fillingId: 'fi-1',
            frostingId: 'fr-1',
            decorationId: 'de-1',
            fruitId: 'fu-1',
        })
        const sum = useCatalogPriceSum(row, catalogs())

        expect(sum.value).toBe(55)
    })

    it('ignora selecciones vacías o que no existen en el catálogo', () => {
        const row = ref({ breadId: '', fillingId: 'no-existe' })
        const sum = useCatalogPriceSum(row, catalogs())

        expect(sum.value).toBe(0)
    })
})
