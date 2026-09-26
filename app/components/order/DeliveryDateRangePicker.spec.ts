import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import DeliveryDateRangePicker from './DeliveryDateRangePicker.vue'

function mountPicker(props: Record<string, unknown> = {}) {
    return mount(DeliveryDateRangePicker, {
        props: { from: '', to: '', visible: true, ...props },
    })
}

describe('DeliveryDateRangePicker', () => {
    it('no renderiza los inputs cuando visible es false', () => {
        const wrapper = mountPicker({ visible: false })

        expect(wrapper.find('input[type="date"]').exists()).toBe(false)
    })

    it('asocia cada label con su input via for/id', () => {
        const wrapper = mountPicker()

        const inputs = wrapper.findAll('input[type="date"]')
        const labels = wrapper.findAll('label')
        expect(inputs).toHaveLength(2)
        expect(labels[0]!.attributes('for')).toBe(inputs[0]!.attributes('id'))
        expect(labels[1]!.attributes('for')).toBe(inputs[1]!.attributes('id'))
    })

    it('emite update:from y update:to al escribir en los inputs', async () => {
        const wrapper = mountPicker()
        const inputs = wrapper.findAll('input[type="date"]')

        await inputs[0]!.setValue('2026-01-01')
        await inputs[1]!.setValue('2026-01-31')

        expect(wrapper.emitted('update:from')?.[0]).toEqual(['2026-01-01'])
        expect(wrapper.emitted('update:to')?.[0]).toEqual(['2026-01-31'])
    })

    it('no muestra el botón Limpiar si no hay fechas elegidas', () => {
        const wrapper = mountPicker()

        expect(wrapper.find('button').exists()).toBe(false)
    })

    it('el botón Limpiar vacía from y to', async () => {
        const wrapper = mountPicker({ from: '2026-01-01', to: '2026-01-31' })

        await wrapper.find('button').trigger('click')

        expect(wrapper.emitted('update:from')?.at(-1)).toEqual([''])
        expect(wrapper.emitted('update:to')?.at(-1)).toEqual([''])
    })
})
