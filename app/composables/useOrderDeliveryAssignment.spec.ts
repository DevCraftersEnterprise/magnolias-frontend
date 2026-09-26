import { describe, expect, it, vi, beforeEach } from 'vitest'

const ordersServiceMock = vi.hoisted(() => ({
    assignOrderDelivery: vi.fn(),
}))
const usersServiceMock = vi.hoisted(() => ({
    getDriversByBranch: vi.fn(),
}))

vi.mock('~/services/orders.service', () => ({
    ordersService: ordersServiceMock,
}))
vi.mock('~/services/users.service', () => ({
    usersService: usersServiceMock,
}))

import { useOrderDeliveryAssignment } from './useOrderDeliveryAssignment'

describe('useOrderDeliveryAssignment', () => {
    beforeEach(() => {
        ordersServiceMock.assignOrderDelivery.mockReset()
        usersServiceMock.getDriversByBranch.mockReset()
    })

    describe('loadDrivers', () => {
        it('carga los repartidores de la sucursal y actualiza driversLoading', async () => {
            const drivers = [{ id: 'driver-1', name: 'Luis', lastname: 'Pérez' }]
            usersServiceMock.getDriversByBranch.mockResolvedValue(drivers)
            const { drivers: driversRef, driversLoading, loadDrivers } =
                useOrderDeliveryAssignment()

            const promise = loadDrivers('branch-1')
            expect(driversLoading.value).toBe(true)
            await promise

            expect(usersServiceMock.getDriversByBranch).toHaveBeenCalledWith(
                'branch-1',
            )
            expect(driversRef.value).toEqual(drivers)
            expect(driversLoading.value).toBe(false)
        })

        it('apaga driversLoading aunque la carga falle', async () => {
            usersServiceMock.getDriversByBranch.mockRejectedValue(
                new Error('500'),
            )
            const { driversLoading, loadDrivers } = useOrderDeliveryAssignment()

            await expect(loadDrivers('branch-1')).rejects.toThrow()
            expect(driversLoading.value).toBe(false)
        })
    })

    describe('assignDriver', () => {
        it('llama al servicio y marca assigningOrderId mientras está en curso', async () => {
            const assignment = { id: 'a1', driver: { id: 'driver-1' } }
            ordersServiceMock.assignOrderDelivery.mockResolvedValue(assignment)
            const { assigningOrderId, assignDriver } = useOrderDeliveryAssignment()

            const promise = assignDriver('order-1', 'driver-1')
            expect(assigningOrderId.value).toBe('order-1')
            const result = await promise

            expect(ordersServiceMock.assignOrderDelivery).toHaveBeenCalledWith(
                'order-1',
                'driver-1',
            )
            expect(result).toBe(assignment)
            expect(assigningOrderId.value).toBeNull()
        })

        it('limpia assigningOrderId aunque falle la asignación', async () => {
            ordersServiceMock.assignOrderDelivery.mockRejectedValue(
                new Error('400'),
            )
            const { assigningOrderId, assignDriver } = useOrderDeliveryAssignment()

            await expect(assignDriver('order-1', 'driver-1')).rejects.toThrow()
            expect(assigningOrderId.value).toBeNull()
        })
    })
})
