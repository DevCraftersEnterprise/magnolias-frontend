import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderDetailCatalogPriceCheck from './OrderDetailCatalogPriceCheck.vue'

describe('OrderDetailCatalogPriceCheck', () => {
    it('muestra el precio sugerido de catálogo junto al precio capturado', () => {
        const wrapper = mount(OrderDetailCatalogPriceCheck, {
            props: { hasTiers: false, price: 300, catalogPriceSum: 50 },
        })

        expect(wrapper.text()).toContain('Precio sugerido de catálogo');
        expect(wrapper.text()).toContain('Precio capturado (línea)');
    })

    it('no muestra el precio sugerido cuando la suma es 0', () => {
        const wrapper = mount(OrderDetailCatalogPriceCheck, {
            props: { hasTiers: false, price: 300, catalogPriceSum: 0 },
        })

        expect(wrapper.text()).not.toContain('Precio sugerido de catálogo');
        expect(wrapper.text()).toContain('Precio capturado (línea)');
    })

    it('no muestra el precio sugerido cuando el producto tiene pisos (el cálculo es por producto simple)', () => {
        const wrapper = mount(OrderDetailCatalogPriceCheck, {
            props: { hasTiers: true, price: 300, catalogPriceSum: 50 },
        })

        expect(wrapper.text()).not.toContain('Precio sugerido de catálogo');
    })
})
