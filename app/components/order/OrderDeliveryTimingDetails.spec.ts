import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { describe, expect, it } from 'vitest'
import OrderDeliveryTimingDetails from './OrderDeliveryTimingDetails.vue'

function baseProps(overrides: Record<string, unknown> = {}) {
    return {
        step2: reactive({
            isEvento: false,
            deliveryRound: '',
            deliveryDate: '',
            eventMontageDate: '',
        }),
        specialRoundCost: 0,
        deliveryTimeParts: { h: 8, m: '00', p: 'AM' as const },
        exitTimeParts: { h: 8, m: '00', p: 'AM' as const },
        minDeliveryDate: '2026-01-01',
        deliveryTimeOutOfHours: false,
        deliveryTimeWarningMsg: '',
        exitTimeOutOfHours: false,
        minuteOptions: ['00', '15', '30', '45'],
        ...overrides,
    }
}

describe('OrderDeliveryTimingDetails — ronda especial (cliente #3)', () => {
    it('incluye la opción "Ronda especial" en el select', () => {
        const wrapper = mount(OrderDeliveryTimingDetails, { props: baseProps() })

        expect(wrapper.text()).toContain('Ronda especial')
        expect(wrapper.find('option[value="especial"]').exists()).toBe(true)
    })

    it('no muestra el input de costo adicional si la ronda no es "especial"', () => {
        const wrapper = mount(OrderDeliveryTimingDetails, { props: baseProps() })

        expect(wrapper.find('#special-round-cost').exists()).toBe(false)
    })

    it('muestra el input de costo adicional cuando la ronda es "especial"', () => {
        const props = baseProps()
        props.step2.deliveryRound = 'especial'
        const wrapper = mount(OrderDeliveryTimingDetails, { props })

        expect(wrapper.find('#special-round-cost').exists()).toBe(true)
    })

    it('emite update:specialRoundCost al escribir el costo', async () => {
        const props = baseProps()
        props.step2.deliveryRound = 'especial'
        const wrapper = mount(OrderDeliveryTimingDetails, { props })

        await wrapper.find('#special-round-cost').setValue('150')

        expect(wrapper.emitted('update:specialRoundCost')?.[0]).toEqual([150])
    })

    it('limpia el costo adicional si la ronda deja de ser "especial"', async () => {
        const props = baseProps({ specialRoundCost: 150 })
        props.step2.deliveryRound = 'especial'
        const wrapper = mount(OrderDeliveryTimingDetails, { props })

        props.step2.deliveryRound = '1'
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted('update:specialRoundCost')?.[0]).toEqual([0])
    })
})
