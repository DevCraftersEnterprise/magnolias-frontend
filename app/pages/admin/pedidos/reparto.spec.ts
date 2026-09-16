import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ordersServiceMock = vi.hoisted(() => ({
    getDriverAssignments: vi.fn().mockResolvedValue([]),
    getAvailableDeliveries: vi.fn().mockResolvedValue([]),
    claimDelivery: vi.fn(),
    markDelivered: vi.fn(),
}))
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))

vi.mock('~/services/orders.service', () => ({ ordersService: ordersServiceMock }))
vi.mock('vue-toastification', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-toastification')>()
    return { ...actual, useToast: () => toastMock }
})

import RepartoPage from './reparto.vue'
import { useAuthUser } from '~/composables/useAuthUser'
import { useBranch } from '~/composables/useBranch'
import { useViewAs } from '~/composables/useViewAs'

function availableOrder(overrides: Record<string, unknown> = {}) {
    return {
        id: 'order-1',
        orderCode: 'PED-0001',
        status: 'DONE',
        deliveryDate: new Date().toISOString(),
        isEvento: false,
        isEnTienda: false,
        ...overrides,
    }
}

async function mountPage() {
    const wrapper = mount(RepartoPage, {
        global: { stubs: { teleport: true }, mocks: { navigateTo: navigateToMock } },
    })
    await flushPromises()
    return wrapper
}

describe('pages/admin/pedidos/reparto - pestaña Disponibles (cliente: self-assign de repartidor)', () => {
    beforeEach(() => {
        ordersServiceMock.getDriverAssignments.mockReset().mockResolvedValue([])
        ordersServiceMock.getAvailableDeliveries.mockReset().mockResolvedValue([])
        ordersServiceMock.claimDelivery.mockReset()
        toastMock.success.mockReset()
        toastMock.error.mockReset()
        useAuthUser().user.value = { id: 'driver-1', username: 'repartidor1', isActive: true, role: 'DRIVER' } as any
        useBranch().selectedBranch.value = { id: 'branch-1', name: 'Morelos' } as any
        useViewAs().viewAsDriver.value = false
        useViewAs().viewAsDriverId.value = ''
    })

    it('no muestra la pestaña "Disponibles" cuando un ADMIN/SUPER está previsualizando (el endpoint es solo para repartidores reales)', async () => {
        useAuthUser().user.value = { id: 'admin-1', username: 'admin', isActive: true, role: 'ADMIN' } as any
        useViewAs().viewAsDriver.value = true
        useViewAs().viewAsDriverId.value = 'driver-2'

        const wrapper = await mountPage()

        expect(wrapper.text()).not.toContain('Disponibles')
    })

    it('un repartidor real ve la pestaña "Disponibles" y puede cargar la lista', async () => {
        ordersServiceMock.getAvailableDeliveries.mockResolvedValue([
            availableOrder({ orderCode: 'PED-0002' }),
        ])

        const wrapper = await mountPage()
        const tabs = wrapper.findAll('button').filter((b) => b.text().includes('Disponibles'))
        expect(tabs.length).toBeGreaterThan(0)
        await tabs[0]!.trigger('click')
        await flushPromises()

        expect(ordersServiceMock.getAvailableDeliveries).toHaveBeenCalled()
        expect(wrapper.text()).toContain('PED-0002')
    })

    it('toma un pedido disponible y refresca ambas listas', async () => {
        ordersServiceMock.getAvailableDeliveries.mockResolvedValue([availableOrder()])
        ordersServiceMock.claimDelivery.mockResolvedValue({ id: 'assignment-1' })

        const wrapper = await mountPage()
        const tabs = wrapper.findAll('button').filter((b) => b.text().includes('Disponibles'))
        await tabs[0]!.trigger('click')
        await flushPromises()

        const claimBtn = wrapper.findAll('button').find((b) => b.text() === 'Tomar pedido')
        expect(claimBtn).toBeTruthy()
        await claimBtn!.trigger('click')
        await flushPromises()

        expect(ordersServiceMock.claimDelivery).toHaveBeenCalledWith('order-1')
        expect(toastMock.success).toHaveBeenCalled()
        expect(ordersServiceMock.getAvailableDeliveries).toHaveBeenCalledTimes(2)
        expect(ordersServiceMock.getDriverAssignments).toHaveBeenCalled()
    })

    it('muestra un error y refresca la lista si el pedido ya fue tomado por otro repartidor (409)', async () => {
        ordersServiceMock.getAvailableDeliveries.mockResolvedValue([availableOrder()])
        ordersServiceMock.claimDelivery.mockRejectedValue(
            new Error('Este pedido ya fue tomado por otro repartidor'),
        )

        const wrapper = await mountPage()
        const tabs = wrapper.findAll('button').filter((b) => b.text().includes('Disponibles'))
        await tabs[0]!.trigger('click')
        await flushPromises()

        const claimBtn = wrapper.findAll('button').find((b) => b.text() === 'Tomar pedido')
        await claimBtn!.trigger('click')
        await flushPromises()

        expect(toastMock.error).toHaveBeenCalledWith(
            'Este pedido ya fue tomado por otro repartidor',
        )
        expect(ordersServiceMock.getAvailableDeliveries).toHaveBeenCalledTimes(2)
    })
})
