import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderDetailAssignmentRow from './OrderDetailAssignmentRow.vue'

const bakers = [
    { id: 'baker-1', name: 'Ana', lastname: 'Pérez' },
    { id: 'baker-2', name: 'Luis', lastname: 'Gómez' },
] as never

function mountRow(props: Record<string, unknown> = {}) {
    return mount(OrderDetailAssignmentRow, {
        props: {
            detailId: 'detail-1',
            assignment: null,
            bakers,
            loading: false,
            ...props,
        },
    })
}

describe('OrderDetailAssignmentRow', () => {
    it('muestra "Sin asignar" cuando no hay assignment', () => {
        const wrapper = mountRow()

        const select = wrapper.find('select')
        expect((select.element as HTMLSelectElement).value).toBe('')
    })

    it('precarga el repostero asignado actual', () => {
        const wrapper = mountRow({
            assignment: {
                id: 'a1',
                baker: { id: 'baker-2', name: 'Luis', lastname: 'Gómez' },
                assignedDate: '2026-01-01T00:00:00Z',
            },
        })

        const select = wrapper.find('select')
        expect((select.element as HTMLSelectElement).value).toBe('baker-2')
    })

    it('emite assign con el bakerId seleccionado', async () => {
        const wrapper = mountRow()

        await wrapper.find('select').setValue('baker-1')

        expect(wrapper.emitted('assign')?.[0]).toEqual(['baker-1'])
    })

    it('deshabilita el select mientras loading es true', () => {
        const wrapper = mountRow({ loading: true })

        expect(wrapper.find('select').attributes('disabled')).toBeDefined()
    })

    it('lista todos los reposteros recibidos como opciones', () => {
        const wrapper = mountRow()

        const options = wrapper.findAll('option')
        // "Sin asignar" + 2 bakers
        expect(options).toHaveLength(3)
        expect(options[1]!.text()).toContain('Ana');
        expect(options[2]!.text()).toContain('Luis');
    })
})
