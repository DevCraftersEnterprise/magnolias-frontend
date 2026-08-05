import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { TierRow } from '~/composables/useProductBuilder'
import OrderProductTiersEditor from './OrderProductTiersEditor.vue'

function tier(overrides: Partial<TierRow> = {}): TierRow {
    return {
        localId: 'tier-1',
        position: 1,
        sizeId: '',
        customSize: '',
        colorId: '',
        breadId: '',
        fillingId: '',
        frostingId: '',
        ...overrides,
    }
}

function mountEditor(
    tiers: TierRow[] = [tier(), tier({ localId: 'tier-2', position: 2 })],
) {
    return mount(OrderProductTiersEditor, {
        props: {
            hasTiers: true,
            tiers,
            colorCatalog: [{ id: 'color-1', name: 'Rosa', value: '#ff00ff' }],
            breadTypes: [{ id: 'bread-1', name: 'Vainilla' }],
            fillings: [{ id: 'filling-1', name: 'Fresa' }],
            frostings: [{ id: 'frosting-1', name: 'Chantilly' }],
            minTiers: 2,
        },
    })
}

describe('OrderProductTiersEditor', () => {
    it('emite update:has-tiers al cambiar el checkbox', async () => {
        const wrapper = mount(OrderProductTiersEditor, {
            props: {
                hasTiers: false,
                tiers: [],
                colorCatalog: [],
                breadTypes: [],
                fillings: [],
                frostings: [],
                minTiers: 2,
            },
        })

        const checkbox = wrapper.find('input[type="checkbox"]')
        await checkbox.setValue(true)

        expect(wrapper.emitted('update:has-tiers')?.[0]).toEqual([true])
    })

    it('no muestra el editor de pisos cuando hasTiers es false', () => {
        const wrapper = mount(OrderProductTiersEditor, {
            props: {
                hasTiers: false,
                tiers: [],
                colorCatalog: [],
                breadTypes: [],
                fillings: [],
                frostings: [],
                minTiers: 2,
            },
        })

        expect(wrapper.text()).not.toContain('Agregar piso')
    })

    it('renderiza una tarjeta por cada piso', () => {
        const wrapper = mountEditor()

        expect(wrapper.text()).toContain('Piso 1')
        expect(wrapper.text()).toContain('Piso 2')
    })

    it('emite add-tier al hacer click en "Agregar piso"', async () => {
        const wrapper = mountEditor()

        await wrapper.find('button').trigger('click')

        expect(wrapper.emitted('add-tier')).toHaveLength(1)
    })

    it('no muestra el botón "Quitar" cuando solo hay minTiers pisos', () => {
        const wrapper = mountEditor()

        expect(wrapper.text()).not.toContain('Quitar')
    })

    it('muestra "Quitar" y emite remove-tier con el índice correcto por encima de minTiers', async () => {
        const wrapper = mountEditor([
            tier(),
            tier({ localId: 'tier-2', position: 2 }),
            tier({ localId: 'tier-3', position: 3 }),
        ])
        const removeButtons = wrapper
            .findAll('button')
            .filter((b) => b.text() === 'Quitar')
        expect(removeButtons).toHaveLength(3)

        await removeButtons[0]!.trigger('click')

        expect(wrapper.emitted('remove-tier')?.[0]).toEqual([0])
    })

    it('muestra el input de tamaño personalizado solo cuando sizeId es CUSTOM', () => {
        const withCustom = mountEditor([tier({ sizeId: 'CUSTOM' })])
        const withoutCustom = mountEditor([tier({ sizeId: '20P' })])

        expect(withCustom.find('input[type="text"]').exists()).toBe(true)
        expect(withoutCustom.find('input[type="text"]').exists()).toBe(false)
    })
})
