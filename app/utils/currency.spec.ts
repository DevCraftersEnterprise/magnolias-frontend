import { describe, it, expect } from 'vitest'

describe('formatMXN', () => {
    it('formatea un número como moneda MXN', () => {
        expect(formatMXN(1500)).toBe('$1,500.00')
    })

    it('trata valores nulos/undefined como 0', () => {
        expect(formatMXN(0)).toBe('$0.00')
    })
})