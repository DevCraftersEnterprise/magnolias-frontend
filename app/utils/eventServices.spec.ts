import { describe, expect, it } from 'vitest'
import {
    buildEventServicesPayload,
    defaultEventServicesFlags,
    parseEventServicesPayload,
} from './eventServices'

describe('defaultEventServicesFlags', () => {
    it('retorna todos los flags en false', () => {
        expect(defaultEventServicesFlags()).toEqual({
            dessertTable: false,
            cake: false,
            cheeseTable: false,
            plated: false,
            trays: false,
            snackTable: false,
        })
    })
})

describe('buildEventServicesPayload', () => {
    it('incluye solo los servicios marcados', () => {
        const flags = defaultEventServicesFlags()
        flags.cake = true
        flags.trays = true

        expect(buildEventServicesPayload(flags)).toEqual(['CAKE', 'TRAYS'])
    })

    it('retorna un arreglo vacío si no hay servicios marcados', () => {
        expect(buildEventServicesPayload(defaultEventServicesFlags())).toEqual([])
    })

    it('incluye Charolas y Mesa de bocadillos (cliente #4)', () => {
        const flags = defaultEventServicesFlags()
        flags.trays = true
        flags.snackTable = true

        expect(buildEventServicesPayload(flags)).toEqual(['TRAYS', 'SNACK_TABLE'])
    })
})

describe('parseEventServicesPayload', () => {
    it('marca los flags correspondientes a los valores recibidos', () => {
        const flags = parseEventServicesPayload(['CAKE', 'SNACK_TABLE'])

        expect(flags.cake).toBe(true)
        expect(flags.snackTable).toBe(true)
        expect(flags.dessertTable).toBe(false)
        expect(flags.trays).toBe(false)
    })

    it('retorna todos los flags en false cuando no hay valores', () => {
        expect(parseEventServicesPayload(undefined)).toEqual(
            defaultEventServicesFlags(),
        )
        expect(parseEventServicesPayload(null)).toEqual(
            defaultEventServicesFlags(),
        )
        expect(parseEventServicesPayload([])).toEqual(defaultEventServicesFlags())
    })

    it('ignora valores desconocidos', () => {
        const flags = parseEventServicesPayload(['NO_EXISTE', 'CAKE'])

        expect(flags.cake).toBe(true)
    })
})
