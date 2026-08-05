import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { TierRow } from '~/composables/useProductBuilder'
import OrderDetailTiersSummary from './OrderDetailTiersSummary.vue'

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

const colorName = (id: string) => (id === 'color-1' ? 'Rosa' : id)
const catalogLabel = (catalog: { id: string; name: string }[], id: string) =>
    catalog.find((c) => c.id === id)?.name ?? id

function mountSummary(tiers: TierRow[]) {
    return mount(OrderDetailTiersSummary, {
        props: {
            tiers,
            colorName,
            catalogLabel,
            breadTypes: [{ id: 'bread-1', name: 'Vainilla' }],
            fillings: [{ id: 'filling-1', name: 'Fresa' }],
            frostings: [{ id: 'frosting-1', name: 'Chantilly' }],
        },
    })
}

describe('OrderDetailTiersSummary', () => {
    it('renderiza una fila por piso numerada desde 1', () => {
        const wrapper = mountSummary([
            tier(),
            tier({ localId: 'tier-2', position: 2 }),
        ])

        expect(wrapper.text()).toContain('Piso 1')
        expect(wrapper.text()).toContain('Piso 2')
    })

    it('resume tamaño, color, pan, relleno y cubierta separados por ·', () => {
        const wrapper = mountSummary([
            tier({
                sizeId: '30P',
                colorId: 'color-1',
                breadId: 'bread-1',
                fillingId: 'filling-1',
                frostingId: 'frosting-1',
            }),
        ])

        expect(wrapper.text()).toContain(
            '30P · Rosa · Vainilla · Fresa · Chantilly',
        )
    })

    it('usa customSize cuando sizeId es CUSTOM', () => {
        const wrapper = mountSummary([
            tier({ sizeId: 'CUSTOM', customSize: '100 personas' }),
        ])

        expect(wrapper.text()).toContain('100 personas')
    })

    it('muestra "—" cuando el piso no tiene ningún dato', () => {
        const wrapper = mountSummary([tier()])

        expect(wrapper.text()).toContain('—')
    })
})
