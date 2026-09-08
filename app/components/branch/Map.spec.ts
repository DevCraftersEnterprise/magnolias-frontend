import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BranchMap from './Map.vue'

function mountMap(props: Record<string, unknown> = {}) {
    return mount(BranchMap, {
        props: {
            name: 'Sucursal Centro',
            ...props,
        },
    })
}

describe('BranchMap', () => {
    it('muestra el degradado de respaldo cuando no hay locationUrl', () => {
        const wrapper = mountMap({ locationUrl: null })

        expect(wrapper.find('iframe').exists()).toBe(false)
        expect(wrapper.find('button').exists()).toBe(false)
    })

    it('usa el enlace de "insertar un mapa" tal cual si ya trae output=embed', () => {
        const url = 'https://www.google.com/maps/embed?pb=abc123'
        const wrapper = mountMap({ locationUrl: url })

        expect(wrapper.find('iframe').attributes('src')).toBe(url)
    })

    it('agrega output=embed a un enlace normal de Google Maps sin query previa', () => {
        const url = 'https://www.google.com/maps/place/Foo'
        const wrapper = mountMap({ locationUrl: url })

        expect(wrapper.find('iframe').attributes('src')).toBe(
            `${url}?output=embed`,
        )
    })

    it('agrega output=embed con "&" cuando el enlace ya trae query params', () => {
        const url = 'https://maps.google.com/?q=21.88,-102.29'
        const wrapper = mountMap({ locationUrl: url })

        expect(wrapper.find('iframe').attributes('src')).toBe(
            `${url}&output=embed`,
        )
    })

    it('muestra el botón "Ver en Google Maps" solo cuando hay locationUrl', () => {
        const wrapper = mountMap({
            locationUrl: 'https://maps.app.goo.gl/abc123',
        })

        expect(wrapper.find('button').text()).toContain('Ver en Google Maps')
    })
})
