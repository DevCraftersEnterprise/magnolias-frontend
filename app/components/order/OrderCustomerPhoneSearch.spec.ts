import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderCustomerPhoneSearch from './OrderCustomerPhoneSearch.vue'

function mountField(props: Record<string, unknown> = {}) {
    return mount(OrderCustomerPhoneSearch, {
        props: {
            phoneQuery: '',
            phoneSearchMode: 'prefix',
            searching: false,
            ...props,
        },
    })
}

describe('OrderCustomerPhoneSearch', () => {
    it('usa maxlength 10 y el placeholder de teléfono en modo prefix', () => {
        const wrapper = mountField()

        const input = wrapper.find('input')
        expect(input.attributes('maxlength')).toBe('10')
        expect(input.attributes('placeholder')).toBe('Ingresa número de teléfono')
    })

    it('usa maxlength 4 y el placeholder de last4 en modo last4', () => {
        const wrapper = mountField({ phoneSearchMode: 'last4' })

        const input = wrapper.find('input')
        expect(input.attributes('maxlength')).toBe('4')
        expect(input.attributes('placeholder')).toBe('Últimos 4 dígitos')
    })

    it('emite set-mode al hacer click en cada botón del toggle', async () => {
        const wrapper = mountField()
        const buttons = wrapper.findAll('button[type="button"]')

        await buttons[0]!.trigger('click')
        await buttons[1]!.trigger('click')

        expect(wrapper.emitted('set-mode')?.[0]).toEqual(['prefix'])
        expect(wrapper.emitted('set-mode')?.[1]).toEqual(['last4'])
    })

    it('emite input al escribir en el campo', async () => {
        const wrapper = mountField()

        await wrapper.find('input').setValue('5551234567')

        expect(wrapper.emitted('input')).toBeTruthy()
    })

    it('emite search al presionar Enter', async () => {
        const wrapper = mountField()

        await wrapper.find('input').trigger('keydown', { key: 'Enter' })

        expect(wrapper.emitted('search')).toBeTruthy()
    })

    it('emite search al hacer click en el botón de búsqueda', async () => {
        const wrapper = mountField()

        await wrapper.find('input + button').trigger('click')

        expect(wrapper.emitted('search')).toBeTruthy()
    })

    it('muestra el spinner mientras searching es true', () => {
        const wrapper = mountField({ searching: true })

        expect(wrapper.find('.animate-spin').exists()).toBe(true)
    })
})
