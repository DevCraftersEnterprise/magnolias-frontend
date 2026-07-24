import { describe, expect, it, vi } from 'vitest'
import { useLoadMore } from './useLoadMore'

describe('useLoadMore', () => {
    it('empieza con el estado inicial esperado', () => {
        const { limit, offset, hasMore } = useLoadMore(vi.fn(), 10)

        expect(limit.value).toBe(10)
        expect(offset.value).toBe(0)
        expect(hasMore.value).toBe(false)
    })

    it('loadMore incrementa el offset y llama loadFn cuando hay más páginas', async () => {
        const loadFn = vi.fn().mockResolvedValue(undefined)
        const { offset, update, loadMore } = useLoadMore(loadFn, 10)
        update({ totalPages: 3, currentPage: 1 })

        await loadMore()

        expect(offset.value).toBe(10)
        expect(loadFn).toHaveBeenCalledTimes(1)
    })

    it('loadMore no hace nada si no hay más páginas', async () => {
        const loadFn = vi.fn()
        const { loadMore } = useLoadMore(loadFn, 10)

        await loadMore()

        expect(loadFn).not.toHaveBeenCalled()
    })

    it('reset() vuelve offset a 0 y permite cargar más (currentPage interno vuelve a 1)', () => {
        const { offset, hasMore, update, reset } = useLoadMore(vi.fn(), 10)
        update({ totalPages: 3, currentPage: 3 })
        expect(hasMore.value).toBe(false)

        reset()

        expect(offset.value).toBe(0)
        expect(hasMore.value).toBe(true)
    })
})
