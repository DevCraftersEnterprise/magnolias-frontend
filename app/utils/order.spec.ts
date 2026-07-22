import { describe, expect, it } from 'vitest'
import { PRODUCT_SIZE_LABELS } from './order'

describe('PRODUCT_SIZE_LABELS', () => {
    it('contiene exactamente los 8 tamaños esperados, en el orden del formulario', () => {
        expect(Object.keys(PRODUCT_SIZE_LABELS)).toEqual([
            '10P',
            '15P',
            '20P',
            '25P',
            '30P',
            '40P',
            '50P',
            'CUSTOM',
        ])
    })

    it('etiqueta CUSTOM como "Personalizado"', () => {
        expect(PRODUCT_SIZE_LABELS.CUSTOM).toBe('Personalizado')
    })

    it('todas las etiquetas son strings no vacíos', () => {
        for (const label of Object.values(PRODUCT_SIZE_LABELS)) {
            expect(typeof label).toBe('string')
            expect(label.length).toBeGreaterThan(0)
        }
    })
})
