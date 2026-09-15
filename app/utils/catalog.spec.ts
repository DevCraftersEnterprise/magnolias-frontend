import { describe, expect, it } from 'vitest'
import { catalogPrice } from './catalog'

describe('catalogPrice', () => {
    it('resuelve el precio (money del backend) desde un arreglo genérico', () => {
        const arr = [{ id: 'x1', price: '$50.00' }, { id: 'x2', price: undefined }]

        expect(catalogPrice(arr, 'x1')).toBe(50)
        expect(catalogPrice(arr, 'x2')).toBe(0)
        expect(catalogPrice(arr, 'no-existe')).toBe(0)
    })
})
