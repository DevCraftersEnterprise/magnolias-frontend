import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { describe, expect, it } from 'vitest'
import { defaultEventServicesFlags } from '~/utils/eventServices'
import OrderEventServicesAndDetails from './OrderEventServicesAndDetails.vue'

function mountComponent() {
    const step2 = reactive({
        deliveryDate: '',
        eventServices: defaultEventServicesFlags(),
        eventGuestCount: '' as number | '',
        eventResponsibleName: '',
    })
    const wrapper = mount(OrderEventServicesAndDetails, { props: { step2 } })
    return { wrapper, step2 }
}

describe('OrderEventServicesAndDetails — Charolas y Mesa de bocadillos (cliente #4)', () => {
    it('muestra las 6 opciones de servicio, incluidas las 2 nuevas', () => {
        const { wrapper } = mountComponent()

        expect(wrapper.text()).toContain('Mesa de Postres')
        expect(wrapper.text()).toContain('Pastel')
        expect(wrapper.text()).toContain('Mesa de Quesos')
        expect(wrapper.text()).toContain('Platillos')
        expect(wrapper.text()).toContain('Charolas')
        expect(wrapper.text()).toContain('Mesa de bocadillos')
        expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(6)
    })

    it('marcar el checkbox de Charolas emite update:eventService con "trays"', async () => {
        const { wrapper } = mountComponent()

        const checkboxes = wrapper.findAll('input[type="checkbox"]')
        await checkboxes[4]!.setValue(true) // orden de EVENT_SERVICE_OPTIONS: ...plated, trays, snackTable

        expect(wrapper.emitted('update:eventService')?.[0]).toEqual([
            'trays',
            true,
        ])
    })

    it('marcar el checkbox de Mesa de bocadillos emite update:eventService con "snackTable"', async () => {
        const { wrapper } = mountComponent()

        const checkboxes = wrapper.findAll('input[type="checkbox"]')
        await checkboxes[5]!.setValue(true)

        expect(wrapper.emitted('update:eventService')?.[0]).toEqual([
            'snackTable',
            true,
        ])
    })
})
