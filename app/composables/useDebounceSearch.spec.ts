import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounceSearch } from './useDebounceSearch'

describe('useDebounceSearch', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('actualiza debouncedQuery y llama fn tras el delay', async () => {
        const fn = vi.fn()
        const { query, debouncedQuery } = useDebounceSearch(fn, 350)

        query.value = 'hola'
        await nextTick()
        vi.advanceTimersByTime(350)

        expect(fn).toHaveBeenCalledTimes(1)
        expect(debouncedQuery.value).toBe('hola')
    })

    it('varios cambios rápidos solo disparan fn una vez (debounce real)', async () => {
        const fn = vi.fn()
        const { query } = useDebounceSearch(fn, 350)

        query.value = 'h'
        await nextTick()
        vi.advanceTimersByTime(100)
        query.value = 'ho'
        await nextTick()
        vi.advanceTimersByTime(100)
        query.value = 'hol'
        await nextTick()
        vi.advanceTimersByTime(350)

        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('aplica la función transform al valor final', async () => {
        const fn = vi.fn()
        const { query, debouncedQuery } = useDebounceSearch(fn, 350, (v) =>
            v.toUpperCase(),
        )

        query.value = 'hola'
        await nextTick()
        vi.advanceTimersByTime(350)

        expect(debouncedQuery.value).toBe('HOLA')
    })

    it('clear() limpia ambos valores y llama fn de inmediato', () => {
        const fn = vi.fn()
        const { query, debouncedQuery, clear } = useDebounceSearch(fn, 350)

        clear()

        expect(query.value).toBe('')
        expect(debouncedQuery.value).toBe('')
        expect(fn).toHaveBeenCalledTimes(1)
    })
})
