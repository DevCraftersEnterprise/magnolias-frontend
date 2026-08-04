import { describe, expect, it } from 'vitest'
import { PRODUCT_SIZE_LABELS, getOrderMode, getOrderTypeColor, getOrderTypeLabel } from './order'

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

describe('getOrderMode / getOrderTypeLabel / getOrderTypeColor', () => {
    it('evento tiene prioridad sobre en tienda', () => {
        const flags = { isEvento: true, isEnTienda: true }
        expect(getOrderMode(flags)).toBe('evento')
        expect(getOrderTypeLabel(flags)).toBe('Evento')
    })

    it('en tienda cuando isEvento es false', () => {
        const flags = { isEvento: false, isEnTienda: true }
        expect(getOrderMode(flags)).toBe('enTienda')
        expect(getOrderTypeLabel(flags)).toBe('En tienda')
    })

    it('domicilio implícito cuando ninguna bandera está activa', () => {
        const flags = { isEvento: false, isEnTienda: false }
        expect(getOrderMode(flags)).toBe('domicilio')
        expect(getOrderTypeLabel(flags)).toBe('Domicilio')
    })

    it('getOrderTypeColor devuelve un color distinto por cada modo', () => {
        const evento = getOrderTypeColor({ isEvento: true })
        const enTienda = getOrderTypeColor({ isEnTienda: true })
        const domicilio = getOrderTypeColor({})

        expect(new Set([evento.bg, enTienda.bg, domicilio.bg]).size).toBe(3)
    })
})
