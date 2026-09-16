import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderDeliveryAssignmentRow from './OrderDeliveryAssignmentRow.vue'

const drivers = [
    { id: 'driver-1', name: 'Luis', lastname: 'Pérez' },
    { id: 'driver-2', name: 'Karla', lastname: 'Gómez' },
] as never

function mountRow(props: Record<string, unknown> = {}) {
    return mount(OrderDeliveryAssignmentRow, {
        props: {
            orderId: 'order-1',
            assignment: null,
            drivers,
            loading: false,
            ...props,
        },
    })
}

describe('OrderDeliveryAssignmentRow', () => {
    it('muestra "Sin asignar" cuando no hay assignment', () => {
        const wrapper = mountRow()

        const select = wrapper.find('select')
        expect((select.element as HTMLSelectElement).value).toBe('')
    })

    it('precarga el repartidor asignado actual', () => {
        const wrapper = mountRow({
            assignment: {
                id: 'a1',
                driver: { id: 'driver-2', name: 'Karla', lastname: 'Gómez' },
                assignedDate: '2026-01-01T00:00:00Z',
            },
        })

        const select = wrapper.find('select')
        expect((select.element as HTMLSelectElement).value).toBe('driver-2')
    })

    it('emite assign con el driverId seleccionado', async () => {
        const wrapper = mountRow()

        await wrapper.find('select').setValue('driver-1')

        expect(wrapper.emitted('assign')?.[0]).toEqual(['driver-1'])
    })

    it('deshabilita el select mientras loading es true', () => {
        const wrapper = mountRow({ loading: true })

        expect(wrapper.find('select').attributes('disabled')).toBeDefined()
    })

    it('deshabilita el select y no emite assign cuando readOnly es true (cliente: no reasignar tras entregado/cancelado)', async () => {
        const wrapper = mountRow({ readOnly: true })

        const select = wrapper.find('select')
        expect(select.attributes('disabled')).toBeDefined()

        await select.setValue('driver-1')

        expect(wrapper.emitted('assign')).toBeUndefined()
    })

    it('lista todos los repartidores recibidos como opciones', () => {
        const wrapper = mountRow()

        const options = wrapper.findAll('option')
        // "Sin asignar" + 2 drivers
        expect(options).toHaveLength(3)
        expect(options[1]!.text()).toContain('Luis');
        expect(options[2]!.text()).toContain('Karla');
    })
})
