import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from './api.client'

function mockFetchResponse(overrides: Partial<Response> & { json?: () => Promise<unknown> } = {}) {
    return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
        ...overrides,
    }
}

function clearAccessTokenCookie() {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

describe('apiFetch', () => {
    beforeEach(() => {
        clearAccessTokenCookie()
        vi.stubGlobal('fetch', vi.fn())
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        clearAccessTokenCookie()
    })

    it('serializa un objeto plano como JSON y agrega Content-Type', async () => {
        const payload = { fullName: 'Ana', phone: '5555555555' }
        vi.mocked(fetch).mockResolvedValue(
            mockFetchResponse({ json: async () => ({ id: '1' }) }) as Response,
        )

        await apiFetch('/api/customers', { method: 'POST', body: payload })

        const [url, init] = vi.mocked(fetch).mock.calls[0]!
        expect(String(url)).toContain('/api/customers')
        expect(init?.body).toBe(JSON.stringify(payload))
        expect((init?.headers as Headers).get('Content-Type')).toBe('application/json')
    })

    it('no serializa FormData y quita el Content-Type manual', async () => {
        const fd = new FormData()
        fd.append('file', new Blob(['x']))
        vi.mocked(fetch).mockResolvedValue(mockFetchResponse() as Response)

        await apiFetch('/api/upload', { method: 'POST', body: fd })

        const [, init] = vi.mocked(fetch).mock.calls[0]!
        expect(init?.body).toBe(fd)
        expect((init?.headers as Headers).has('Content-Type')).toBe(false)
    })

    it('agrega el header Authorization cuando hay token real en la cookie y auth !== false', async () => {
        document.cookie = 'access_token=abc123; path=/'
        vi.mocked(fetch).mockResolvedValue(mockFetchResponse() as Response)

        await apiFetch('/api/private', { auth: true })

        const [, init] = vi.mocked(fetch).mock.calls[0]!
        expect((init?.headers as Headers).get('Authorization')).toBe('Bearer abc123')
    })

    it('no agrega Authorization cuando auth es false, aunque exista la cookie', async () => {
        document.cookie = 'access_token=abc123; path=/'
        vi.mocked(fetch).mockResolvedValue(mockFetchResponse() as Response)

        await apiFetch('/api/public', { auth: false })

        const [, init] = vi.mocked(fetch).mock.calls[0]!
        expect((init?.headers as Headers).has('Authorization')).toBe(false)
    })

    it('lanza un error normalizado cuando la respuesta no es ok', async () => {
        vi.mocked(fetch).mockResolvedValue(
            mockFetchResponse({
                ok: false,
                status: 404,
                json: async () => ({ message: 'No encontrado' }),
            }) as Response,
        )

        await expect(apiFetch('/api/missing')).rejects.toMatchObject({
            status: 404,
            message: 'No encontrado',
        })
    })

    it('convierte un message de arreglo (ValidationPipe de Nest) en un string legible', async () => {
        vi.mocked(fetch).mockResolvedValue(
            mockFetchResponse({
                ok: false,
                status: 400,
                json: async () => ({
                    statusCode: 400,
                    message: [
                        'Invalid piping location',
                        'Product ID must be a valid UUID',
                    ],
                    error: 'Bad Request',
                }),
            }) as Response,
        )

        await expect(apiFetch('/api/orders')).rejects.toMatchObject({
            status: 400,
            message: 'Invalid piping location Product ID must be a valid UUID',
        })
    })

    it('usa data.error cuando no hay message', async () => {
        vi.mocked(fetch).mockResolvedValue(
            mockFetchResponse({
                ok: false,
                status: 401,
                json: async () => ({ error: 'Unauthorized' }),
            }) as Response,
        )

        await expect(apiFetch('/api/private')).rejects.toMatchObject({
            status: 401,
            message: 'Unauthorized',
        })
    })
})
