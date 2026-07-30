import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useViewAs } from './useViewAs'
import { useAuthUser } from './useAuthUser'
import type { AuthUser } from '~/types/auth.types'

const { navigateToMock } = vi.hoisted(() => ({
    navigateToMock: vi.fn(),
}))

mockNuxtImport('navigateTo', () => navigateToMock)

function setUserRole(role: AuthUser['role'] | null) {
    useAuthUser().user.value = role
        ? ({ id: 'u1', username: 'x', isActive: true, role } as AuthUser)
        : null
}

describe('useViewAs', () => {
    beforeEach(() => {
        navigateToMock.mockReset()
        useViewAs().viewAsBaker.value = false
        setUserRole(null)
    })

    describe('canToggleViewAs', () => {
        it('es true para ADMIN y SUPER', () => {
            setUserRole('ADMIN')
            expect(useViewAs().canToggleViewAs.value).toBe(true)

            setUserRole('SUPER')
            expect(useViewAs().canToggleViewAs.value).toBe(true)
        })

        it('es false para EMPLOYEE, BAKER y ASSISTANT', () => {
            for (const role of ['EMPLOYEE', 'BAKER', 'ASSISTANT'] as const) {
                setUserRole(role)
                expect(useViewAs().canToggleViewAs.value).toBe(false)
            }
        })
    })

    describe('effectiveRole', () => {
        it('retorna el rol real cuando la vista simulada está apagada', () => {
            setUserRole('ADMIN')
            expect(useViewAs().effectiveRole.value).toBe('ADMIN')
        })

        it('retorna BAKER cuando un ADMIN activa la vista simulada', async () => {
            setUserRole('ADMIN')
            const { enterViewAsBaker, effectiveRole } = useViewAs()

            await enterViewAsBaker()

            expect(effectiveRole.value).toBe('BAKER')
        })
    })

    describe('enterViewAsBaker', () => {
        it('activa viewAsBaker y navega a /admin/pedidos cuando el rol lo permite', async () => {
            setUserRole('SUPER')
            const { enterViewAsBaker, viewAsBaker } = useViewAs()

            await enterViewAsBaker()

            expect(viewAsBaker.value).toBe(true)
            expect(navigateToMock).toHaveBeenCalledWith('/admin/pedidos')
        })

        it('no hace nada si el rol real no puede simular', async () => {
            setUserRole('BAKER')
            const { enterViewAsBaker, viewAsBaker } = useViewAs()

            await enterViewAsBaker()

            expect(viewAsBaker.value).toBe(false)
            expect(navigateToMock).not.toHaveBeenCalled()
        })
    })

    describe('exitViewAs', () => {
        it('desactiva viewAsBaker sin navegar, para quedarse en la página actual', async () => {
            setUserRole('ADMIN')
            const { enterViewAsBaker, exitViewAs, viewAsBaker } = useViewAs()
            await enterViewAsBaker()
            navigateToMock.mockClear()

            exitViewAs()

            expect(viewAsBaker.value).toBe(false)
            expect(navigateToMock).not.toHaveBeenCalled()
        })
    })
})
