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

    it('no muestra el input de precio cuando hidePrice es true (Forma no maneja precio)', () => {
        const wrapper = mountModal({
            hidePrice: true,
            model: { name: '', description: '' },
        })

        expect(wrapper.find('input[type="number"]').exists()).toBe(false)
    })

    it('emite save sin price aunque el model ya tuviera uno, cuando hidePrice es true', async () => {
        const wrapper = mountModal({
            hidePrice: true,
            mode: 'edit',
            model: { id: 'st-1', name: 'Rústico', price: 50 },
        })

        await wrapper.find('button.bg-\\[\\#1F1F1F\\]').trigger('click')

        expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
            name: 'Rústico',
            price: undefined,
        })
    })

    it('no muestra "Tamaños aplicables" cuando showApplicableSizes es false', () => {
        const wrapper = mountModal({ model: { name: '', description: '' } })

        expect(wrapper.text()).not.toContain('Tamaños aplicables')
    })

    it('muestra y precarga los tamaños aplicables cuando showApplicableSizes es true (cliente #5)', () => {
        const wrapper = mountModal({
            showApplicableSizes: true,
            mode: 'edit',
            model: { id: 'st-1', name: 'Rústico', applicableSizes: ['20P'] },
        })

        expect(wrapper.text()).toContain('Tamaños aplicables')
        const checkboxes = wrapper.findAll('input[type="checkbox"]')
        const checked = checkboxes.filter((c) => (c.element as HTMLInputElement).checked)
        expect(checked).toHaveLength(1)
    })

    it('emite save con los tamaños aplicables elegidos', async () => {
        const wrapper = mountModal({
            showApplicableSizes: true,
            model: { name: '', description: '' },
        })

        await wrapper.find('input[type="text"]').setValue('Rústico')
        const checkboxes = wrapper.findAll('input[type="checkbox"]')
        await checkboxes[0]!.setValue(true)
        await wrapper.find('button.bg-\\[\\#1F1F1F\\]').trigger('click')

        expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
            name: 'Rústico',
            applicableSizes: ['10P'],
        })
    })

    it('omite applicableSizes cuando ninguno fue elegido', async () => {
        const wrapper = mountModal({
            showApplicableSizes: true,
            model: { name: '', description: '' },
        })

        await wrapper.find('input[type="text"]').setValue('Moderno')
        await wrapper.find('button.bg-\\[\\#1F1F1F\\]').trigger('click')

        expect(wrapper.emitted('save')?.[0]?.[0]).toMatchObject({
            name: 'Moderno',
            applicableSizes: undefined,
        })
    })
})
