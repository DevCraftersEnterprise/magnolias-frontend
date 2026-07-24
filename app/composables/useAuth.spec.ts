import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from './useAuth'
import { useAuthUser } from './useAuthUser'

const authServiceMock = vi.hoisted(() => ({
    login: vi.fn(),
    refresh: vi.fn(),
    validate: vi.fn(),
}))

vi.mock('~/services/auth.service', () => ({
    authService: authServiceMock,
}))

function clearAuthCookies() {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
}

describe('useAuth', () => {
    beforeEach(() => {
        clearAuthCookies()
        authServiceMock.login.mockReset()
        authServiceMock.refresh.mockReset()
        authServiceMock.validate.mockReset()
        useAuthUser().clearUser()
    })

    afterEach(() => {
        clearAuthCookies()
    })

    describe('ensureSession', () => {
        it('retorna false si no hay ningún token', async () => {
            const { ensureSession } = useAuth()

            const result = await ensureSession()

            expect(result).toBe(false)
            expect(authServiceMock.validate).not.toHaveBeenCalled()
            expect(authServiceMock.refresh).not.toHaveBeenCalled()
        })

        it('valida el access token existente sin necesidad de refrescar', async () => {
            document.cookie = 'access_token=valid-access; path=/'
            authServiceMock.validate.mockResolvedValue({
                valid: true,
                user: { id: 'u1', name: 'Ana' },
            })

            const { ensureSession, user } = useAuth()
            const result = await ensureSession()

            expect(result).toBe(true)
            expect(authServiceMock.validate).toHaveBeenCalledTimes(1)
            expect(authServiceMock.refresh).not.toHaveBeenCalled()
            expect(user.value).toEqual({ id: 'u1', name: 'Ana' })
        })

        it('si el access token es inválido, intenta refrescar con el refresh token', async () => {
            document.cookie = 'access_token=expired-access; path=/'
            document.cookie = 'refresh_token=valid-refresh; path=/'
            authServiceMock.validate.mockRejectedValue(new Error('401'))
            authServiceMock.refresh.mockResolvedValue({
                accessToken: 'new-access',
                refreshToken: 'new-refresh',
                user: { id: 'u1', name: 'Ana' },
            })

            const { ensureSession, access, refresh, user } = useAuth()
            const result = await ensureSession()

            expect(result).toBe(true)
            expect(authServiceMock.refresh).toHaveBeenCalledWith({
                refreshToken: 'valid-refresh',
            })
            expect(access.value).toBe('new-access')
            expect(refresh.value).toBe('new-refresh')
            expect(user.value).toEqual({ id: 'u1', name: 'Ana' })
        })

        it('si no hay access token pero sí refresh token, refresca directo', async () => {
            document.cookie = 'refresh_token=valid-refresh; path=/'
            authServiceMock.refresh.mockResolvedValue({
                accessToken: 'new-access',
                refreshToken: 'new-refresh',
                user: { id: 'u1', name: 'Ana' },
            })

            const { ensureSession, access } = useAuth()
            const result = await ensureSession()

            expect(result).toBe(true)
            expect(authServiceMock.validate).not.toHaveBeenCalled()
            expect(access.value).toBe('new-access')
        })

        it('limpia la sesión y retorna false si tanto validar como refrescar fallan', async () => {
            document.cookie = 'access_token=expired-access; path=/'
            document.cookie = 'refresh_token=expired-refresh; path=/'
            authServiceMock.validate.mockRejectedValue(new Error('401'))
            authServiceMock.refresh.mockRejectedValue(new Error('401'))

            const { ensureSession, access, refresh, user } = useAuth()
            const result = await ensureSession()

            expect(result).toBe(false)
            expect(access.value).toBeNull()
            expect(refresh.value).toBeNull()
            expect(user.value).toBeNull()
        })

        it('limpia la sesión y retorna false si el refresh directo falla', async () => {
            document.cookie = 'refresh_token=expired-refresh; path=/'
            authServiceMock.refresh.mockRejectedValue(new Error('401'))

            const { ensureSession, refresh } = useAuth()
            const result = await ensureSession()

            expect(result).toBe(false)
            expect(refresh.value).toBeNull()
        })
    })

    describe('login', () => {
        it('guarda los tokens y limpia el usuario cacheado tras un login exitoso', async () => {
            authServiceMock.login.mockResolvedValue({
                accessToken: 'new-access',
                refreshToken: 'new-refresh',
            })

            const { login, access, refresh, loading } = useAuth()
            await login('ana', 'clave')

            expect(authServiceMock.login).toHaveBeenCalledWith({
                username: 'ana',
                userkey: 'clave',
            })
            expect(access.value).toBe('new-access')
            expect(refresh.value).toBe('new-refresh')
            expect(loading.value).toBe(false)
        })

        it('deja loading en false incluso si el login falla', async () => {
            authServiceMock.login.mockRejectedValue(new Error('Credenciales inválidas'))

            const { login, loading } = useAuth()

            await expect(login('ana', 'mala-clave')).rejects.toThrow(
                'Credenciales inválidas',
            )
            expect(loading.value).toBe(false)
        })
    })

    describe('logout', () => {
        it('limpia tokens y usuario', () => {
            document.cookie = 'access_token=algo; path=/'
            document.cookie = 'refresh_token=algo; path=/'

            const { logout, access, refresh, user } = useAuth()
            logout()

            expect(access.value).toBeNull()
            expect(refresh.value).toBeNull()
            expect(user.value).toBeNull()
        })
    })
})
