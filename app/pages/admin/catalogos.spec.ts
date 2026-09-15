import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const catalogsServiceMock = vi.hoisted(() => ({
    getColors: vi.fn().mockResolvedValue([]),
    getBreadTypes: vi.fn().mockResolvedValue({ items: [], pagination: {} }),
    getFillings: vi.fn().mockResolvedValue({ items: [], pagination: {} }),
    getFrostings: vi.fn().mockResolvedValue({ items: [], pagination: {} }),
    getStyles: vi.fn().mockResolvedValue({ items: [], pagination: {} }),
    getFlowers: vi.fn().mockResolvedValue({ items: [], pagination: {} }),
    getDecorations: vi.fn().mockResolvedValue({
        items: [{ id: 'de-1', name: 'PERLAS DORADAS', description: '', isActive: true, price: '$8.00' }],
        pagination: {},
    }),
    getFruits: vi.fn().mockResolvedValue({ items: [], pagination: {} }),
    createDecoration: vi.fn().mockResolvedValue({}),
    patchDecoration: vi.fn().mockResolvedValue({}),
    createFruit: vi.fn().mockResolvedValue({}),
    patchFruit: vi.fn().mockResolvedValue({}),
}))

vi.mock('~/services/catalogs.service', () => ({ catalogsService: catalogsServiceMock }))

import CatalogosPage from './catalogos.vue'

async function mountPage() {
    const wrapper = mount(CatalogosPage, {
        global: { stubs: { teleport: true } },
    })
    await flushPromises()
    return wrapper
}

describe('pages/admin/catalogos', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        catalogsServiceMock.getColors.mockResolvedValue([])
        catalogsServiceMock.getBreadTypes.mockResolvedValue({ items: [], pagination: {} })
        catalogsServiceMock.getFillings.mockResolvedValue({ items: [], pagination: {} })
        catalogsServiceMock.getFrostings.mockResolvedValue({ items: [], pagination: {} })
        catalogsServiceMock.getStyles.mockResolvedValue({ items: [], pagination: {} })
        catalogsServiceMock.getFlowers.mockResolvedValue({ items: [], pagination: {} })
        catalogsServiceMock.getDecorations.mockResolvedValue({
            items: [{ id: 'de-1', name: 'PERLAS DORADAS', description: '', isActive: true, price: '$8.00' }],
            pagination: {},
        })
        catalogsServiceMock.getFruits.mockResolvedValue({ items: [], pagination: {} })
    })

    it('crea una decoración nueva con su precio', async () => {
        const wrapper = await mountPage()

        const addButtons = wrapper.findAll('button[aria-label="Agregar"]')
        const decoracionCardAdd = addButtons[6]! // orden de `cards`: pan, relleno, flor, estilo, color, cubierta, decoracion, fruta
        await decoracionCardAdd.trigger('click')

        await wrapper.find('input[type="text"]').setValue('Chispas')
        await wrapper.find('input[type="number"]').setValue('12')
        await wrapper.find('button.bg-\\[\\#1F1F1F\\]').trigger('click')
        await flushPromises()

        expect(catalogsServiceMock.createDecoration).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Chispas', price: 12 }),
        )
        expect(catalogsServiceMock.getDecorations).toHaveBeenCalled()
    })

    it('edita una decoración existente (PATCH con isActive true)', async () => {
        const wrapper = await mountPage()

        const editButtons = wrapper.findAll('button[aria-label="Editar"]')
        expect(editButtons.length).toBeGreaterThan(0)
        await editButtons[0]!.trigger('click')

        await wrapper.find('button.bg-\\[\\#1F1F1F\\]').trigger('click')
        await flushPromises()

        expect(catalogsServiceMock.patchDecoration).toHaveBeenCalledWith(
            'de-1',
            expect.objectContaining({ name: 'PERLAS DORADAS', isActive: true }),
        )
    })

    it('crea una fruta nueva con su precio', async () => {
        const wrapper = await mountPage()

        const addButtons = wrapper.findAll('button[aria-label="Agregar"]')
        const frutaCardAdd = addButtons[7]!
        await frutaCardAdd.trigger('click')

        await wrapper.find('input[type="text"]').setValue('Mango')
        await wrapper.find('input[type="number"]').setValue('9.5')
        await wrapper.find('button.bg-\\[\\#1F1F1F\\]').trigger('click')
        await flushPromises()

        expect(catalogsServiceMock.createFruit).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Mango', price: 9.5 }),
        )
    })
})
