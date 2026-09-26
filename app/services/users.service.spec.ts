import { describe, expect, it, vi, beforeEach } from 'vitest'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('~/services/api.client', () => ({
    apiFetch: apiFetchMock,
}))

import { usersService } from './users.service'

describe('usersService — repartidores (Cliente #8)', () => {
    beforeEach(() => {
        apiFetchMock.mockReset()
        apiFetchMock.mockResolvedValue([])
    })

    it('getDriversByBranch llama al endpoint correcto con GET', async () => {
        await usersService.getDriversByBranch('branch-1')

        expect(apiFetchMock).toHaveBeenCalledWith(
            '/api/users/drivers/branch-1',
            expect.objectContaining({ method: 'GET', auth: true }),
        )
    })
})
