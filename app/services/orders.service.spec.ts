import { describe, expect, it, vi, beforeEach } from 'vitest'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('~/services/api.client', () => ({
    apiFetch: apiFetchMock,
}))

import { ordersService } from './orders.service'

describe('ordersService — asignación por línea (Cliente #11)', () => {
    beforeEach(() => {
        apiFetchMock.mockReset()
        apiFetchMock.mockResolvedValue({})
    })

    describe('assignOrderDetail', () => {
        it('llama al endpoint correcto con bakerId', async () => {
            await ordersService.assignOrderDetail('detail-1', 'baker-1')

            expect(apiFetchMock).toHaveBeenCalledWith(
                '/api/orders/details/detail-1/assign',
                expect.objectContaining({
                    method: 'POST',
                    auth: true,
                    body: JSON.stringify({ bakerId: 'baker-1' }),
                }),
            )
        })

        it('incluye notes en el body cuando se provee', async () => {
            await ordersService.assignOrderDetail(
                'detail-1',
                'baker-1',
                'Urgente',
            )

            expect(apiFetchMock).toHaveBeenCalledWith(
                '/api/orders/details/detail-1/assign',
                expect.objectContaining({
                    body: JSON.stringify({ bakerId: 'baker-1', notes: 'Urgente' }),
                }),
            )
        })
    })

    describe('getBakerDetailAssignments', () => {
        it('llama al endpoint correcto con GET', async () => {
            await ordersService.getBakerDetailAssignments('baker-1')

            expect(apiFetchMock).toHaveBeenCalledWith(
                '/api/orders/details/assignments/baker-1',
                expect.objectContaining({ method: 'GET', auth: true }),
            )
        })
    })

    describe('updateDetailProductionStatus', () => {
        it('llama al endpoint correcto con PATCH y el status en el body', async () => {
            await ordersService.updateDetailProductionStatus(
                'detail-1',
                'IN_PROCESS',
            )

            expect(apiFetchMock).toHaveBeenCalledWith(
                '/api/orders/details/detail-1/production-status',
                expect.objectContaining({
                    method: 'PATCH',
                    auth: true,
                    body: JSON.stringify({ status: 'IN_PROCESS' }),
                }),
            )
        })
    })
})
