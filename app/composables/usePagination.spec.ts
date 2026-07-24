import { describe, expect, it, vi } from 'vitest'
import { usePagination } from './usePagination'

describe('usePagination', () => {
    it('empieza con el estado inicial esperado', () => {
        const { pagination, canPrev, canNext } = usePagination(vi.fn(), 10)

        expect(pagination.value).toEqual({
            limit: 10,
            offset: 0,
            totalPages: 1,
            currentPage: 1,
            total: 0,
        })
        expect(canPrev.value).toBe(false)
        expect(canNext.value).toBe(false)
    })

    it('update() aplica totalPages/currentPage/total, con mínimo 1', () => {
        const { pagination, update } = usePagination(vi.fn(), 10)

        update({ totalPages: 0, currentPage: 0 }, 25)

        expect(pagination.value.totalPages).toBe(1)
        expect(pagination.value.currentPage).toBe(1)
        expect(pagination.value.total).toBe(25)
    })

    it('showingFrom/showingTo calculan el rango mostrado', () => {
        const { pagination, update, showingFrom, showingTo } = usePagination(
            vi.fn(),
            10,
        )
        update({ totalPages: 3, currentPage: 2 }, 25)
        pagination.value.offset = 10

        expect(showingFrom(10)).toBe(11)
        expect(showingTo(10)).toBe(20)
    })

    it('showingFrom retorna 0 si no hay resultados', () => {
        const { showingFrom } = usePagination(vi.fn(), 10)
        expect(showingFrom(0)).toBe(0)
    })

    it('nextPage avanza el offset y llama loadFn(false) cuando hay más páginas', async () => {
        const loadFn = vi.fn().mockResolvedValue(undefined)
        const { pagination, update, nextPage } = usePagination(loadFn, 10)
        update({ totalPages: 2, currentPage: 1 }, 15)

        await nextPage()

        expect(pagination.value.offset).toBe(10)
        expect(loadFn).toHaveBeenCalledWith(false)
    })

    it('nextPage no hace nada si ya está en la última página', async () => {
        const loadFn = vi.fn()
        const { update, nextPage } = usePagination(loadFn, 10)
        update({ totalPages: 1, currentPage: 1 }, 5)

        await nextPage()

        expect(loadFn).not.toHaveBeenCalled()
    })

    it('prevPage retrocede el offset sin bajar de 0', async () => {
        const loadFn = vi.fn().mockResolvedValue(undefined)
        const { pagination, update, prevPage } = usePagination(loadFn, 10)
        pagination.value.offset = 10
        update({ totalPages: 2, currentPage: 2 }, 15)

        await prevPage()

        expect(pagination.value.offset).toBe(0)
        expect(loadFn).toHaveBeenCalledWith(false)
    })

    it('prevPage no hace nada si el offset ya es 0', async () => {
        const loadFn = vi.fn()
        const { prevPage } = usePagination(loadFn, 10)

        await prevPage()

        expect(loadFn).not.toHaveBeenCalled()
    })

    it('reset() vuelve el offset a 0', () => {
        const { pagination, reset } = usePagination(vi.fn(), 10)
        pagination.value.offset = 30

        reset()

        expect(pagination.value.offset).toBe(0)
    })
})
