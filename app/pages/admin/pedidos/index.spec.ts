import { mount, flushPromises } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ordersServiceMock = vi.hoisted(() => ({
    getOrders: vi.fn().mockResolvedValue({ items: [], total: 0, pagination: {} }),
    getBakerDetailAssignments: vi.fn().mockResolvedValue([]),
    markDelivered: vi.fn(),
    cancelOrder: vi.fn(),
    updateDetailProductionStatus: vi.fn(),
}))
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), warning: vi.fn() }))
const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))

vi.mock('~/services/orders.service', () => ({ ordersService: ordersServiceMock }))
vi.mock('vue-toastification', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-toastification')>()
    return { ...actual, useToast: () => toastMock }
})
mockNuxtImport('navigateTo', () => navigateToMock)

import PedidosIndexPage from './index.vue'
import { useAuthUser } from '~/composables/useAuthUser'
import { useBranch } from '~/composables/useBranch'
import { useViewAs } from '~/composables/useViewAs'

function assignmentCard(overrides: Record<string, unknown> = {}) {
    return {
        orderDetail: {
            id: 'detail-1',
            productionStatus: 'PENDING',
            product: { name: 'Pastel' },
            order: {
                id: 'order-1',
                orderCode: 'PED-0001',
                status: 'CREATED',
                deliveryDate: new Date(Date.now() + 86400000).toISOString(),
            },
        },
        ...overrides,
    }
}

async function mountPage() {
    const wrapper = mount(PedidosIndexPage)
    await flushPromises()
    return wrapper
}

describe('pages/admin/pedidos/index - kanban de pastelero', () => {
    beforeEach(() => {
        ordersServiceMock.getOrders.mockClear().mockResolvedValue({ items: [], total: 0, pagination: {} })
        ordersServiceMock.getBakerDetailAssignments.mockReset().mockResolvedValue([])
        navigateToMock.mockReset()
        useBranch().branches.value = []
        useBranch().selectedBranch.value = { id: 'branch-1', name: 'Morelos' } as any
        useBranch().bakerBranches.value = []
        useViewAs().viewAsBaker.value = false
        useViewAs().viewAsBakerId.value = ''
    })

    it('un pastelero real consulta el kanban con su propio id de usuario', async () => {
        useAuthUser().user.value = { id: 'baker-1', username: 'ana', isActive: true, role: 'BAKER' } as any

        await mountPage()

        expect(ordersServiceMock.getBakerDetailAssignments).toHaveBeenCalledWith('baker-1')
    })

    it('un ADMIN/SUPER previsualizando usa el pastelero elegido en el Topbar, no su propio id', async () => {
        useAuthUser().user.value = { id: 'admin-1', username: 'admin', isActive: true, role: 'ADMIN' } as any
        useViewAs().viewAsBaker.value = true
        useViewAs().viewAsBakerId.value = 'baker-2'

        await mountPage()

        expect(ordersServiceMock.getBakerDetailAssignments).toHaveBeenCalledWith('baker-2')
        expect(ordersServiceMock.getBakerDetailAssignments).not.toHaveBeenCalledWith('admin-1')
    })

    it('un ADMIN/SUPER sin elegir pastelero no consulta nada (kanban vacío con aviso)', async () => {
        useAuthUser().user.value = { id: 'admin-1', username: 'admin', isActive: true, role: 'ADMIN' } as any
        useViewAs().viewAsBaker.value = true
        useViewAs().viewAsBakerId.value = ''

        const wrapper = await mountPage()

        expect(ordersServiceMock.getBakerDetailAssignments).not.toHaveBeenCalled()
        expect(wrapper.text()).toContain('Selecciona un pastelero')
    })

    it('navega al detalle de la línea al hacer click en una tarjeta del kanban', async () => {
        useAuthUser().user.value = { id: 'baker-1', username: 'ana', isActive: true, role: 'BAKER' } as any
        ordersServiceMock.getBakerDetailAssignments.mockResolvedValue([assignmentCard()])

        const wrapper = await mountPage()
        const card = wrapper.find('button[aria-label="Ver detalle del pedido"]')
        expect(card.exists()).toBe(true)
        await card.trigger('click')

        expect(navigateToMock).toHaveBeenCalledWith('/admin/pedidos/detalle/order-1')
    })
})

describe('pages/admin/pedidos/index - tabla y refrescar', () => {
    beforeEach(() => {
        ordersServiceMock.getOrders.mockClear().mockResolvedValue({ items: [], total: 0, pagination: {} })
        navigateToMock.mockReset()
        useAuthUser().user.value = { id: 'admin-1', username: 'admin', isActive: true, role: 'ADMIN' } as any
        useBranch().selectedBranch.value = { id: 'branch-1', name: 'Morelos' } as any
        useViewAs().viewAsBaker.value = false
        useViewAs().viewAsBakerId.value = ''
    })

    it('carga los pedidos de la sucursal seleccionada al montar', async () => {
        await mountPage()

        expect(ordersServiceMock.getOrders).toHaveBeenCalledWith(
            'branch-1',
            expect.any(Object),
        )
    })

    it('el botón Actualizar vuelve a pedir los pedidos', async () => {
        const wrapper = await mountPage()
        ordersServiceMock.getOrders.mockClear()

        await wrapper.find('button[aria-label="Actualizar lista de pedidos"]').trigger('click')
        await flushPromises()

        expect(ordersServiceMock.getOrders).toHaveBeenCalledTimes(1)
    })

    it('no carga pedidos si no hay sucursal seleccionada', async () => {
        useBranch().selectedBranch.value = null

        const wrapper = await mountPage()

        expect(wrapper.text()).toContain('Selecciona una sucursal')
    })
})
