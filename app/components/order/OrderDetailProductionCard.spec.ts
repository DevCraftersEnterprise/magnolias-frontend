import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OrderDetailProductionCard from './OrderDetailProductionCard.vue'
import type { OrderDetailAssignmentCard } from '~/types/order.types'

function card(overrides: Record<string, unknown> = {}): OrderDetailAssignmentCard {
    return {
        orderDetail: {
            id: 'detail-1',
            productionStatus: 'PENDING',
            modifiedAfterProduction: false,
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
    it('muestra la hora de entrega 2 horas antes de la real (cliente: hora de pastelero)', () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: {
                card: card({ order: { id: 'order-1', orderCode: 'PED-0001', deliveryTime: '15:30' } }),
                accent: 'amber',
                actionLabel: 'Iniciar producción →',
            },
        })

        expect(wrapper.text()).toContain('13:30')
        expect(wrapper.text()).not.toContain('15:30')
    })

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

    it('ya no tiene ningún botón de avance directo - solo "Ver detalle" (cliente: obliga a abrir el detalle)', () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: { card: card(), accent: 'violet', actionLabel: 'Marcar como listo →' },
        })

        expect(wrapper.findAll('button')).toHaveLength(1)
        expect(wrapper.text()).not.toContain('Marcar como listo →')
    })

    it('no muestra "Saldo pendiente" cuando actionLabel no se pasa (columna Listos)', () => {
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

    it('muestra "Modificado desde sucursal" cuando modifiedAfterProduction es true', () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: {
                card: card({ modifiedAfterProduction: true }),
                accent: 'violet',
                actionLabel: 'Marcar como listo →',
            },
        })

        expect(wrapper.text()).toContain('Modificado desde sucursal')
    })

    it('no muestra "Modificado desde sucursal" cuando modifiedAfterProduction es false', () => {
        const wrapper = mount(OrderDetailProductionCard, {
            props: { card: card(), accent: 'amber', actionLabel: 'Iniciar producción →' },
        })

        expect(wrapper.text()).not.toContain('Modificado desde sucursal')
    })
})
