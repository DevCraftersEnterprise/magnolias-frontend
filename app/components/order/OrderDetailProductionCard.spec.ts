import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderDetailProductionCard from './OrderDetailProductionCard.vue'
import type { OrderDetailAssignmentCard } from '~/types/order.types'

function card(overrides: Record<string, unknown> = {}): OrderDetailAssignmentCard {
    return {
        orderDetail: {
            id: 'detail-1',
            productionStatus: 'PENDING',
            product: { name: 'Pastel de chocolate' },
            order: {
                id: 'order-1',
                orderCode: 'PED-0001',
                status: 'CREATED',
                deliveryDate: new Date().toISOString(),
                isEvento: false,
                isEnTienda: false,
            },
            ...overrides,
        },
    } as unknown as OrderDetailAssignmentCard
}

describe('OrderDetailProductionCard', () => {
    it('renderiza los datos del pedido y de la línea', () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: { card: card(), accent: 'amber', actionLabel: 'Iniciar producción →' },
        })

        expect(wrapper.text()).toContain('PED-0001')
        expect(wrapper.text()).toContain('Pastel de chocolate')
    })

    it('emite view al hacer click en la tarjeta', async () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: { card: card(), accent: 'amber', actionLabel: 'Iniciar producción →' },
        })

        await wrapper.find('button[aria-label="Ver detalle del pedido"]').trigger('click')

        expect(wrapper.emitted('view')).toHaveLength(1)
    })

    it('emite advance al hacer click en el botón de acción, sin disparar view', async () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: { card: card(), accent: 'violet', actionLabel: 'Marcar como listo →' },
        })

        const buttons = wrapper.findAll('button')
        const actionBtn = buttons.find((b) => b.text() === 'Marcar como listo →')
        expect(actionBtn).toBeTruthy()
        await actionBtn!.trigger('click')

        expect(wrapper.emitted('advance')).toHaveLength(1)
        expect(wrapper.emitted('view')).toBeUndefined()
    })

    it('no muestra botón de acción ni "Saldo pendiente" cuando actionLabel no se pasa (columna Listos)', () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: {
                card: card({
                    order: {
                        id: 'order-1',
                        orderCode: 'PED-0001',
                        remainingBalance: '150.00',
                    },
                }),
                accent: 'emerald',
            },
        })

        expect(wrapper.text()).toContain('Listo para entregar')
        expect(wrapper.text()).not.toContain('Saldo pendiente')
        expect(wrapper.findAll('button')).toHaveLength(1)
    })

    it('muestra "Saldo pendiente" cuando hay actionLabel y remainingBalance > 0', () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: {
                card: card({
                    order: {
                        id: 'order-1',
                        orderCode: 'PED-0001',
                        remainingBalance: '150.00',
                    },
                }),
                accent: 'amber',
                actionLabel: 'Iniciar producción →',
            },
        })

        expect(wrapper.text()).toContain('Saldo pendiente')
    })

    it('deshabilita el botón de acción y muestra "Actualizando…" cuando disabled es true', () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: {
                card: card(),
                accent: 'amber',
                actionLabel: 'Iniciar producción →',
                disabled: true,
            },
        })

        const buttons = wrapper.findAll('button')
        const actionBtn = buttons.find((b) => b.text() === 'Actualizando…')
        expect(actionBtn).toBeTruthy()
        expect(actionBtn!.attributes('disabled')).toBeDefined()
    })
})
