import { describe, expect, it } from 'vitest'
import { formatMXN, moneyToNumber } from './currency'

describe('formatMXN', () => {
    it('formatea un número como moneda MXN', () => {
        expect(formatMXN(50)).toContain('50.00')
    })

    it('usa 0 cuando el valor es falsy', () => {
        expect(formatMXN(0)).toContain('0.00')
    })
})

describe('moneyToNumber', () => {
    it('convierte un string money del backend a número', () => {
        expect(moneyToNumber('$50.00')).toBe(50)
    })

    it('convierte un número directo sin cambios', () => {
        expect(moneyToNumber(50)).toBe(50)
    })

    it('retorna 0 para null/undefined/vacío', () => {
        expect(moneyToNumber(null)).toBe(0)
        expect(moneyToNumber(undefined)).toBe(0)
        expect(moneyToNumber('')).toBe(0)
    })
})
