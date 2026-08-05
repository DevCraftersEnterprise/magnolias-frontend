import { describe, expect, it, vi, beforeEach } from 'vitest'

const ordersServiceMock = vi.hoisted(() => ({
    assignOrderDetail: vi.fn(),
}))
const usersServiceMock = vi.hoisted(() => ({
    getBakersByBranch: vi.fn(),
}))

vi.mock('~/services/orders.service', () => ({
    ordersService: ordersServiceMock,
}))
vi.mock('~/services/users.service', () => ({
    usersService: usersServiceMock,
}))

import { useOrderDetailAssignment } from './useOrderDetailAssignment'

describe('useOrderDetailAssignment', () => {
    beforeEach(() => {
        ordersServiceMock.assignOrderDetail.mockReset()
        usersServiceMock.getBakersByBranch.mockReset()
    })

    describe('loadBakers', () => {
        it('carga los reposteros de la sucursal y actualiza bakersLoading', async () => {
            const bakers = [{ id: 'baker-1', name: 'Ana', lastname: 'Pérez' }]
            usersServiceMock.getBakersByBranch.mockResolvedValue(bakers)
            const { bakers: bakersRef, bakersLoading, loadBakers } =
                useOrderDetailAssignment()

            const promise = loadBakers('branch-1')
            expect(bakersLoading.value).toBe(true)
            await promise

            expect(usersServiceMock.getBakersByBranch).toHaveBeenCalledWith(
                'branch-1',
            )
            expect(bakersRef.value).toEqual(bakers)
            expect(bakersLoading.value).toBe(false)
        })

        it('apaga bakersLoading aunque la carga falle', async () => {
            usersServiceMock.getBakersByBranch.mockRejectedValue(
                new Error('500'),
            )
            const { bakersLoading, loadBakers } = useOrderDetailAssignment()

            await expect(loadBakers('branch-1')).rejects.toThrow()
            expect(bakersLoading.value).toBe(false)
        })
    })

    describe('assignBaker', () => {
        it('llama al servicio y marca assigningDetailId mientras está en curso', async () => {
            const assignment = { id: 'a1', baker: { id: 'baker-1' } }
            ordersServiceMock.assignOrderDetail.mockResolvedValue(assignment)
            const { assigningDetailId, assignBaker } = useOrderDetailAssignment()

            const promise = assignBaker('detail-1', 'baker-1')
            expect(assigningDetailId.value).toBe('detail-1')
            const result = await promise

            expect(ordersServiceMock.assignOrderDetail).toHaveBeenCalledWith(
                'detail-1',
                'baker-1',
            )
            expect(result).toBe(assignment)
            expect(assigningDetailId.value).toBeNull()
        })

        it('limpia assigningDetailId aunque falle la asignación', async () => {
            ordersServiceMock.assignOrderDetail.mockRejectedValue(
                new Error('400'),
            )
            const { assigningDetailId, assignBaker } = useOrderDetailAssignment()

            await expect(assignBaker('detail-1', 'baker-1')).rejects.toThrow()
            expect(assigningDetailId.value).toBeNull()
        })
    })
})
