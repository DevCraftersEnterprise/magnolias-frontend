import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ordersServiceMock = vi.hoisted(() => ({
    getOrder: vi.fn(),
    updateOrder: vi.fn(),
    assignOrderDetail: vi.fn(),
}))
const usersServiceMock = vi.hoisted(() => ({
    getBakersByBranch: vi.fn().mockResolvedValue([]),
}))
const catalogsServiceMock = vi.hoisted(() => ({
    getBreadTypes: vi.fn().mockResolvedValue({ items: [] }),
    getFillings: vi.fn().mockResolvedValue({ items: [] }),
    getFrostings: vi.fn().mockResolvedValue({ items: [] }),
    getStyles: vi.fn().mockResolvedValue({ items: [] }),
    getFlowers: vi.fn().mockResolvedValue({ items: [] }),
    getColors: vi.fn().mockResolvedValue([]),
}))
const addressesServiceMock = vi.hoisted(() => ({
    getAddresses: vi.fn().mockResolvedValue([]),
}))
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))

vi.mock('~/services/orders.service', () => ({ ordersService: ordersServiceMock }))
vi.mock('~/services/users.service', () => ({ usersService: usersServiceMock }))
vi.mock('~/services/catalogs.service', () => ({ catalogsService: catalogsServiceMock }))
vi.mock('~/services/addresses.service', () => ({ addressesService: addressesServiceMock }))
vi.mock('vue-toastification', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-toastification')>()
    return { ...actual, useToast: () => toastMock }
})

import DetailModal from './DetailModal.vue'
import type { OrderItem } from '~/types/order.types'

const baseOrder = {
    id: 'order-1',
    orderCode: 'PED-0001',
    status: 'CREATED',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    createdBy: { id: 'u1', name: 'Sucursal', lastname: 'Morelos' },
    updatedBy: { id: 'u1', name: 'Sucursal', lastname: 'Morelos' },
} as unknown as OrderItem

function baseDetail(overrides: Record<string, unknown> = {}) {
    return {
        ...baseOrder,
        branch: { id: 'branch-1', name: 'Morelos' },
        details: [],
        orderFlowers: [],
        payments: [],
        employeeActions: [],
        ...overrides,
    }
}

async function mountModal(order: OrderItem = baseOrder) {
    // El watch de props.open en DetailModal.vue no tiene { immediate: true },
    // así que hay que montar cerrado y luego abrirlo para que dispare la
    // carga del detalle (ordersService.getOrder), igual que en uso real.
    const wrapper = mount(DetailModal, {
        props: { open: false, order },
        global: {
            // DetailModal.vue usa <Teleport to="body"> directamente en su
            // template; se stubea para poder consultar su contenido con
            // wrapper.text()/wrapper.find() sin tener que apuntar a
            // document.body.
            stubs: { teleport: true },
        },
    })
    await wrapper.setProps({ open: true })
    await flushPromises()
    return wrapper
}

describe('DetailModal - autoría (createdBy/updatedBy)', () => {
    beforeEach(() => {
        ordersServiceMock.getOrder.mockReset()
    })

    it('usa el nombre de la cuenta compartida cuando no hay employeeActions', async () => {
        ordersServiceMock.getOrder.mockResolvedValue(baseDetail())

        const wrapper = await mountModal()

        expect(wrapper.text()).toContain('Sucursal Morelos')
    })

    it('prefiere el nombre del empleado real para "Creado por" cuando existe un employeeAction CREATED', async () => {
        ordersServiceMock.getOrder.mockResolvedValue(
            baseDetail({
                employeeActions: [
                    {
                        action: 'CREATED',
                        performedAt: '2026-09-01T10:00:00Z',
                        employee: { name: 'María', lastname: 'García' },
                    },
                ],
            }),
        )

        const wrapper = await mountModal()

        expect(wrapper.text()).toContain('Creado por')
        expect(wrapper.text()).toContain('María García')
        expect(wrapper.text()).not.toContain('Sucursal Morelos')
    })

    it('usa la acción más reciente (no CREATED) para "Actualizado por"', async () => {
        // El guard "Actualizado por" compara order.updatedAt/createdAt del
        // prop (datos de la lista), no del detalle cargado - hay que hacerlos
        // distintos también en el order que se le pasa al componente.
        const order = { ...baseOrder, updatedAt: '2026-09-02T12:00:00Z' } as OrderItem
        ordersServiceMock.getOrder.mockResolvedValue(
            baseDetail({
                updatedAt: '2026-09-02T12:00:00Z',
                employeeActions: [
                    // Ordenado DESC por performedAt, como lo devuelve el backend.
                    {
                        action: 'UPDATED',
                        performedAt: '2026-09-02T12:00:00Z',
                        employee: { name: 'Juan', lastname: 'Pérez' },
                    },
                    {
                        action: 'CREATED',
                        performedAt: '2026-09-01T10:00:00Z',
                        employee: { name: 'María', lastname: 'García' },
                    },
                ],
            }),
        )

        const wrapper = await mountModal(order)

        expect(wrapper.text()).toContain('Creado por')
        expect(wrapper.text()).toContain('María García')
        expect(wrapper.text()).toContain('Actualizado por')
        expect(wrapper.text()).toContain('Juan Pérez')
    })

    it('cae a updatedBy (cuenta compartida) si la acción más reciente es CREATED', async () => {
        const order = { ...baseOrder, updatedAt: '2026-09-02T12:00:00Z' } as OrderItem
        ordersServiceMock.getOrder.mockResolvedValue(
            baseDetail({
                updatedAt: '2026-09-02T12:00:00Z',
                employeeActions: [
                    {
                        action: 'CREATED',
                        performedAt: '2026-09-01T10:00:00Z',
                        employee: { name: 'María', lastname: 'García' },
                    },
                ],
            }),
        )

        const wrapper = await mountModal(order)

        expect(wrapper.text()).toContain('Actualizado por')
        expect(wrapper.text()).toContain('Sucursal Morelos')
    })

    it('no muestra "Actualizado por" cuando createdAt y updatedAt son iguales', async () => {
        ordersServiceMock.getOrder.mockResolvedValue(baseDetail())

        const wrapper = await mountModal()

        expect(wrapper.text()).not.toContain('Actualizado por')
    })

    it('si falla la carga del detalle, cae a los datos de la lista (createdBy de props.order)', async () => {
        ordersServiceMock.getOrder.mockRejectedValue(new Error('network'))

        const wrapper = await mountModal()

        expect(wrapper.text()).toContain('Sucursal Morelos')
    })
})
