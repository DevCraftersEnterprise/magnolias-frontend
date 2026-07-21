import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import authGlobal from "./auth.global";

const { ensureSessionMock, navigateToMock } = vi.hoisted(() => ({
    ensureSessionMock: vi.fn(),
    navigateToMock: vi.fn()
}))

mockNuxtImport('useAuth', () => {
    return () => ({ ensureSession: ensureSessionMock })
})

mockNuxtImport('navigateTo', () => navigateToMock)

describe('middleware/auth.global', () => {
    beforeEach(() => {
        ensureSessionMock.mockReset()
        navigateToMock.mockReset()
    })

    it('no hace nada en rutas fuera de /admin', async () => {
        await authGlobal(
            { path: '/login' } as any,
            { path: '/login' } as any,
        )

        expect(ensureSessionMock).not.toHaveBeenCalled()
        expect(navigateToMock).not.toHaveBeenCalled()
    })

    it('redirige a /login si la sesión no es válida en una ruta /admin', async () => {
        ensureSessionMock.mockResolvedValue(false)

        await authGlobal(
            { path: '/admin/pedidos' } as any,
            { path: '/admin/pedidos' } as any,
        )

        expect(ensureSessionMock).toHaveBeenCalledTimes(1)
        expect(navigateToMock).toHaveBeenCalledWith('/login')
    })

    it('no redirige si la sesión es válida en una ruta /admin', async () => {
        ensureSessionMock.mockResolvedValue(true)

        await authGlobal(
            { path: '/admin/pedidos' } as any,
            { path: '/admin/pedidos' } as any,
        )

        expect(navigateToMock).not.toHaveBeenCalled()
    })

    it('también protege subrutas anidadas de /admin', async () => {
        ensureSessionMock.mockResolvedValue(false)

        await authGlobal(
            { path: '/admin/pedidos/editar/123' } as any,
            { path: '/admin/pedidos/editar/123' } as any,
        )

        expect(navigateToMock).toHaveBeenCalledWith('/login')
    })
})
