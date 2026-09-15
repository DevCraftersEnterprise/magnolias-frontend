import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import driverRedirect from "./driver-redirect";

const { ensureSessionMock, navigateToMock, effectiveRole } = vi.hoisted(() => ({
    ensureSessionMock: vi.fn(),
    navigateToMock: vi.fn(),
    effectiveRole: { value: '' },
}))

mockNuxtImport('useAuth', () => {
    return () => ({ ensureSession: ensureSessionMock })
})

mockNuxtImport('useViewAs', () => {
    return () => ({ effectiveRole })
})

mockNuxtImport('navigateTo', () => navigateToMock)

describe('middleware/driver-redirect', () => {
    beforeEach(() => {
        ensureSessionMock.mockReset()
        navigateToMock.mockReset()
        effectiveRole.value = ''
    })

    it('redirige a /admin/pedidos/reparto cuando el rol efectivo es DRIVER', async () => {
        effectiveRole.value = 'DRIVER'

        await driverRedirect({} as any, {} as any)

        expect(navigateToMock).toHaveBeenCalledWith(
            '/admin/pedidos/reparto',
            { replace: true },
        )
    })

    it('no redirige para otros roles', async () => {
        effectiveRole.value = 'ADMIN'

        await driverRedirect({} as any, {} as any)

        expect(navigateToMock).not.toHaveBeenCalled()
    })
})
