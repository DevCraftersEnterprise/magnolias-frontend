import { beforeEach, describe, expect, it, vi } from 'vitest'

const catalogsServiceMock = vi.hoisted(() => ({
    getBreadTypes: vi.fn(),
    getFillings: vi.fn(),
    getFlavors: vi.fn(),
    getFrostings: vi.fn(),
    getStyles: vi.fn(),
    getFlowers: vi.fn(),
    getColors: vi.fn(),
}))

const addressesServiceMock = vi.hoisted(() => ({
    getAddresses: vi.fn(),
}))

vi.mock('~/services/catalogs.service', () => ({
    catalogsService: catalogsServiceMock,
}))
vi.mock('~/services/addresses.service', () => ({
    addressesService: addressesServiceMock,
}))

import { useOrderCatalogs } from './useOrderCatalogs'

function flushPromises() {
    return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('useOrderCatalogs', () => {
    beforeEach(() => {
        catalogsServiceMock.getBreadTypes.mockResolvedValue({
            items: [{ id: 'bt-1', name: 'Blanco' }],
        })
        catalogsServiceMock.getFillings.mockResolvedValue({
            items: [{ id: 'fi-1', name: 'Chocolate' }],
        })
        catalogsServiceMock.getFlavors.mockResolvedValue({
            items: [{ id: 'fl-1', name: 'Vainilla' }],
        })
        catalogsServiceMock.getFrostings.mockResolvedValue({ items: [] })
        catalogsServiceMock.getStyles.mockResolvedValue({ items: [] })
        catalogsServiceMock.getFlowers.mockResolvedValue({ items: [] })
        catalogsServiceMock.getColors.mockResolvedValue([
            { id: 'co-1', name: 'Rosa', value: '#ffc0cb' },
        ])
        addressesServiceMock.getAddresses.mockResolvedValue([{ id: 'addr-1' }])
    })

    it('carga los catálogos en paralelo al invocarse', async () => {
        const { breadTypes, fillings, flavors, colorCatalog, commonAddresses } =
            useOrderCatalogs()
        await flushPromises()

        expect(breadTypes.value).toEqual([{ id: 'bt-1', name: 'Blanco' }])
        expect(fillings.value).toEqual([{ id: 'fi-1', name: 'Chocolate' }])
        expect(flavors.value).toEqual([{ id: 'fl-1', name: 'Vainilla' }])
        expect(colorCatalog.value).toEqual([
            { id: 'co-1', name: 'Rosa', value: '#ffc0cb' },
        ])
        expect(commonAddresses.value).toEqual([{ id: 'addr-1' }])
    })

    it('si un catálogo falla, los demás se cargan igual (cada .then es independiente)', async () => {
        catalogsServiceMock.getFillings.mockRejectedValue(new Error('500'))

        const { breadTypes, fillings } = useOrderCatalogs()
        await flushPromises()

        expect(breadTypes.value).toEqual([{ id: 'bt-1', name: 'Blanco' }])
        expect(fillings.value).toEqual([])
    })

    it('colorName y colorHex resuelven por id, con fallback vacío', async () => {
        const { colorName, colorHex } = useOrderCatalogs()
        await flushPromises()

        expect(colorName('co-1')).toBe('Rosa')
        expect(colorHex('co-1')).toBe('#ffc0cb')
        expect(colorName('no-existe')).toBe('')
        expect(colorHex('no-existe')).toBe('')
    })

    it('catalogLabel resuelve el nombre desde un arreglo genérico', () => {
        const { catalogLabel } = useOrderCatalogs()
        const arr = [{ id: 'x1', name: 'Uno' }]

        expect(catalogLabel(arr, 'x1')).toBe('Uno')
        expect(catalogLabel(arr, 'no-existe')).toBe('-')
    })

    it('locationLabel usa LOCATION_LABELS y cae al valor original si no está mapeado', () => {
        const { locationLabel } = useOrderCatalogs()

        expect(locationLabel('TOP')).toBe('Arriba')
        expect(locationLabel('rareValue')).toBe('rareValue')
        expect(locationLabel(null)).toBe('')
    })
})
