import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderSourceSelector from './OrderSourceSelector.vue'

function mountField(props: Record<string, unknown> = {}) {
    return mount(OrderSourceSelector, {
        props: {
            orderSource: '',
            ...props,
        },
    })
}

describe('OrderSourceSelector', () => {
    it('lista los 5 canales soportados', () => {
        const wrapper = mountField()

        const values = wrapper
            .findAll('option')
            .map((o) => o.attributes('value'))

        expect(values).toEqual([
            '',
            'WHATSAPP',
            'INSTAGRAM',
            'FACEBOOK',
            'PHONE_CALL',
            'IN_PERSON',
        ])
    })

    it('refleja el valor seleccionado', () => {
        const wrapper = mountField({ orderSource: 'INSTAGRAM' })

        expect(
            (wrapper.find('select').element as HTMLSelectElement).value,
        ).toBe('INSTAGRAM')
    })

    it('emite update:orderSource al cambiar la selección', async () => {
        const wrapper = mountField()

        await wrapper.find('select').setValue('WHATSAPP')

        expect(wrapper.emitted('update:orderSource')?.[0]).toEqual([
            'WHATSAPP',
        ])
    })
})
