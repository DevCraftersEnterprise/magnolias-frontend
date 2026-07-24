import { describe, expect, it, vi } from 'vitest'
import { useCatalogBlock } from './useCatalogBlock'

describe('useCatalogBlock', () => {
    it('carga items y actualiza la paginación', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            items: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }],
            pagination: { totalPages: 2, currentPage: 1 },
        })

        const { items, loading, lm, load } = useCatalogBlock(fetcher)
        const promise = load()
        expect(loading.value).toBe(true)
        await promise

        expect(fetcher).toHaveBeenCalledWith(10, 0)
        expect(items.value).toHaveLength(2)
        expect(loading.value).toBe(false)
        expect(lm.hasMore.value).toBe(true)
    })

    it('filtra elementos inactivos cuando filterActive es true', async () => {
        const fetcher = vi.fn().mockResolvedValue({
            items: [
                { id: '1', isActive: true },
                { id: '2', isActive: false },
            ],
            pagination: { totalPages: 1, currentPage: 1 },
        })

        const { items, load } = useCatalogBlock(fetcher, { filterActive: true })
        await load()

        expect(items.value).toEqual([{ id: '1', isActive: true }])
    })

    it('reset() limpia los items y vuelve a cargar desde el inicio', async () => {
        const fetcher = vi
            .fn()
            .mockResolvedValueOnce({
                items: [{ id: '1' }],
                pagination: { totalPages: 2, currentPage: 1 },
            })
            .mockResolvedValueOnce({
                items: [{ id: '2' }],
                pagination: { totalPages: 1, currentPage: 1 },
            })

        const { items, load, reset } = useCatalogBlock(fetcher)
        await load()
        await reset()

        expect(fetcher).toHaveBeenLastCalledWith(10, 0)
        expect(items.value).toEqual([{ id: '2' }])
    })

    it('acumula items entre llamadas sucesivas a load (carga más)', async () => {
        const fetcher = vi
            .fn()
            .mockResolvedValueOnce({
                items: [{ id: '1' }],
                pagination: { totalPages: 2, currentPage: 1 },
            })
            .mockResolvedValueOnce({
                items: [{ id: '2' }],
                pagination: { totalPages: 2, currentPage: 2 },
            })

        const { items, lm, load } = useCatalogBlock(fetcher)
        await load()
        await lm.loadMore()

        expect(items.value).toEqual([{ id: '1' }, { id: '2' }]);
    })
})
