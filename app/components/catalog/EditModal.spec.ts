import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CatalogEditModal from './EditModal.vue'

function mountModal(props: Partial<InstanceType<typeof CatalogEditModal>['$props']> = {}) {
    return mount(CatalogEditModal, {
        props: {
            modelValue: true,
            mode: 'create',
            model: null,
            ...props,
        },
        global: { stubs: { teleport: true } },
    })
}

describe('CatalogEditModal', () => {
    it('precarga name/description/price desde el model al editar', async () => {
        const wrapper = mountModal({
            mode: 'edit',
            model: { id: 'x1', name: 'Chocolate', description: 'Rico', price: 50 },
        })

        const priceInput = wrapper.find('input[type="number"]')
        expect((priceInput.element as HTMLInputElement).value).toBe('50')
    })

    it('emite save con el price capturado', async () => {
        const wrapper = mountModal({ model: { name: '', description: '' } })

        await wrapper.find('input[type="text"]').setValue('Vainilla')
        await wrapper.find('input[type="number"]').setValue('75.5')
        await wrapper.find('button.bg-\\[\\#1F1F1F\\]').trigger('click')

        expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
            name: 'Vainilla',
            price: 75.5,
        })
    })

    it('permite guardar sin price (queda undefined)', async () => {
        const wrapper = mountModal({ model: { name: '', description: '' } })

        await wrapper.find('input[type="text"]').setValue('Fresa')
        await wrapper.find('button.bg-\\[\\#1F1F1F\\]').trigger('click')

        expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
            name: 'Fresa',
            price: undefined,
        })
    })
})
