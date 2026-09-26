import { describe, expect, it, vi, beforeEach } from 'vitest'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('~/services/api.client', () => ({
    apiFetch: apiFetchMock,
}))

import { catalogsService } from './catalogs.service'

describe('catalogsService — Decoración y Fruta (cliente #2)', () => {
    beforeEach(() => {
        apiFetchMock.mockReset()
        apiFetchMock.mockResolvedValue({})
    })

    it('createDecoration llama al endpoint correcto', async () => {
        await catalogsService.createDecoration({ name: 'Perlas doradas', description: '', price: 8 })

        expect(apiFetchMock).toHaveBeenCalledWith('/api/decorations', {
            method: 'POST',
            auth: true,
            body: { name: 'Perlas doradas', description: '', price: 8 },
        })
    })

    it('patchDecoration llama al endpoint correcto', async () => {
        await catalogsService.patchDecoration('decoration-1', { isActive: false })

        expect(apiFetchMock).toHaveBeenCalledWith('/api/decorations/decoration-1', {
            method: 'PATCH',
            auth: true,
            body: { isActive: false },
        })
    })

    it('deleteDecoration llama al endpoint correcto', async () => {
        await catalogsService.deleteDecoration('decoration-1')

        expect(apiFetchMock).toHaveBeenCalledWith('/api/decorations/decoration-1', {
            method: 'DELETE',
            auth: true,
        })
    })

    it('createFruit llama al endpoint correcto', async () => {
        await catalogsService.createFruit({ name: 'Fresa', description: '', price: 12 })

        expect(apiFetchMock).toHaveBeenCalledWith('/api/fruits', {
            method: 'POST',
            auth: true,
            body: { name: 'Fresa', description: '', price: 12 },
        })
    })

    it('patchFruit llama al endpoint correcto', async () => {
        await catalogsService.patchFruit('fruit-1', { isActive: false })

        expect(apiFetchMock).toHaveBeenCalledWith('/api/fruits/fruit-1', {
            method: 'PATCH',
            auth: true,
            body: { isActive: false },
        })
    })

    it('deleteFruit llama al endpoint correcto', async () => {
        await catalogsService.deleteFruit('fruit-1')

        expect(apiFetchMock).toHaveBeenCalledWith('/api/fruits/fruit-1', {
            method: 'DELETE',
            auth: true,
        })
    })
})
