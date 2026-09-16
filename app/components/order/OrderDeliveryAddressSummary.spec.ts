import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderDeliveryAddressSummary from './OrderDeliveryAddressSummary.vue'

describe('OrderDeliveryAddressSummary', () => {
    it('no renderiza nada cuando no hay dirección', () => {
        const wrapper = mount(OrderDeliveryAddressSummary, {
            props: { address: null },
        })

        expect(wrapper.html()).toBe('<!--v-if-->')
    })

    it('renderiza receptor y teléfono cuando existen', () => {
        const wrapper = mount(OrderDeliveryAddressSummary, {
            props: {
                address: { receiverName: 'Andrea Sofía', receiverPhone: '662 000 2741' },
            },
        })

        expect(wrapper.text()).toContain('Andrea Sofía')
        expect(wrapper.text()).toContain('662 000 2741')
    })

    it('arma la línea de calle/número/colonia/ciudad', () => {
        const wrapper = mount(OrderDeliveryAddressSummary, {
            props: {
                address: {
                    street: 'Sendero del Desierto',
                    number: '412',
                    neighborhood: 'Las Lomas',
                    city: 'Hermosillo',
                },
            },
        })

        expect(wrapper.text()).toContain(
            'Sendero del Desierto, #412, Las Lomas, Hermosillo',
        )
    })

    it('muestra CP, entre calles, interfón, referencia y notas cuando existen', () => {
        const wrapper = mount(OrderDeliveryAddressSummary, {
            props: {
                address: {
                    street: 'Calle 1',
                    postalCode: '83000',
                    betweenStreets: 'Calle A y B',
                    interphoneCode: '1234',
                    reference: 'Casa azul',
                    deliveryNotes: 'Tocar el timbre dos veces',
                },
            },
        })

        expect(wrapper.text()).toContain('CP 83000')
        expect(wrapper.text()).toContain('Entre: Calle A y B')
        expect(wrapper.text()).toContain('Interfón: 1234')
        expect(wrapper.text()).toContain('Ref: Casa azul')
        expect(wrapper.text()).toContain('Nota: Tocar el timbre dos veces')
    })

    it('no revienta con una dirección parcial (sin ningún campo)', () => {
        const wrapper = mount(OrderDeliveryAddressSummary, {
            props: { address: {} },
        })

        expect(wrapper.text()).toBe('')
    })
})
