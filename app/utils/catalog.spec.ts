import { describe, expect, it } from 'vitest'
import { catalogPrice, filterStylesForSize, resetIncompatibleStyle } from './catalog'

describe('catalogPrice', () => {
    it('resuelve el precio (money del backend) desde un arreglo genérico', () => {
        const arr = [{ id: 'x1', price: '$50.00' }, { id: 'x2', price: undefined }]

        expect(catalogPrice(arr, 'x1')).toBe(50)
        expect(catalogPrice(arr, 'x2')).toBe(0)
        expect(catalogPrice(arr, 'no-existe')).toBe(0)
    })
})

describe('filterStylesForSize', () => {
    const styles = [
        { id: 'st-1', applicableSizes: ['20P', '30P'] },
        { id: 'st-2', applicableSizes: [] },
        { id: 'st-3' },
    ]

    it('retorna todas las formas cuando no hay tamaño elegido', () => {
        expect(filterStylesForSize(styles, '')).toEqual(styles)
    })

    it('incluye formas compatibles con el tamaño y formas sin restricción', () => {
        const result = filterStylesForSize(styles, '20P')
        expect(result.map((s) => s.id)).toEqual(['st-1', 'st-2', 'st-3'])
    })

    it('excluye formas restringidas a otros tamaños', () => {
        const result = filterStylesForSize(styles, '50P')
        expect(result.map((s) => s.id)).toEqual(['st-2', 'st-3'])
    })
})

describe('resetIncompatibleStyle', () => {
    const styles = [{ id: 'st-1', applicableSizes: ['20P'] }]

    it('limpia styleId si ya no es compatible con el nuevo tamaño', () => {
        const row = { sizeId: '50P', styleId: 'st-1' }
        resetIncompatibleStyle(row, styles)
        expect(row.styleId).toBe('')
    })

    it('conserva styleId si sigue siendo compatible', () => {
        const row = { sizeId: '20P', styleId: 'st-1' }
        resetIncompatibleStyle(row, styles)
        expect(row.styleId).toBe('st-1')
    })

    it('no hace nada si no hay styleId elegido', () => {
        const row = { sizeId: '50P', styleId: '' }
        resetIncompatibleStyle(row, styles)
        expect(row.styleId).toBe('')
    })
})
