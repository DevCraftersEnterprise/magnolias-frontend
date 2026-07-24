import { describe, expect, it } from 'vitest'
import { withPagination } from './pagination'

describe('withPagination', () => {
    it('arma la query string con limit y offset', () => {
        expect(withPagination('/api/x', 10, 0)).toBe('/api/x?limit=10&offset=0')
    })

    it('agrega parámetros extra con valor', () => {
        expect(withPagination('/api/x', 10, 20, { name: 'ana' })).toBe(
            '/api/x?limit=10&offset=20&name=ana',
        )
    })

    it('omite parámetros extra undefined, null o cadena vacía', () => {
        expect(
            withPagination('/api/x', 10, 0, {
                name: undefined,
                phone: null,
                email: '',
                status: 'ACTIVE',
            }),
        ).toBe('/api/x?limit=10&offset=0&status=ACTIVE')
    })
})
