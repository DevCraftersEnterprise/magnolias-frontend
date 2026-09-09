import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BranchMap from './Map.vue'

function mountMap(props: Record<string, unknown> = {}) {
    return mount(BranchMap, {
        props: {
            address: 'Av. Morelos 314, Ciudad Obregón, Sonora',
            name: 'Sucursal Morelos',
            ...props,
        },
    })
}

describe('BranchMap', () => {
    it('no renderiza ningún iframe (evita el problema de enlaces no embebibles)', () => {
        const wrapper = mountMap()

        expect(wrapper.find('iframe').exists()).toBe(false)
    })

    it('arma el enlace de búsqueda de Google Maps a partir de la dirección', () => {
        const wrapper = mountMap({ address: 'Av. Morelos 314, Ciudad Obregón, Sonora' })

        expect(wrapper.find('a').attributes('href')).toBe(
            'https://www.google.com/maps/search/?api=1&query=Av.%20Morelos%20314%2C%20Ciudad%20Obreg%C3%B3n%2C%20Sonora',
        )
    })

    it('abre el enlace en una pestaña nueva de forma segura', () => {
        const wrapper = mountMap()
        const link = wrapper.find('a')

        expect(link.attributes('target')).toBe('_blank')
        expect(link.attributes('rel')).toBe('noopener noreferrer')
    })

    it('muestra el texto "Ver en Google Maps"', () => {
        const wrapper = mountMap()

        expect(wrapper.text()).toContain('Ver en Google Maps')
    })
})
