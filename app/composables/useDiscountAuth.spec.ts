import { beforeEach, describe, expect, it, vi } from 'vitest'

const authServiceMock = vi.hoisted(() => ({
    verifyDiscountAuthorization: vi.fn(),
}))

vi.mock('~/services/auth.service', () => ({
    authService: authServiceMock,
}))

import { useDiscountAuth } from './useDiscountAuth'

describe('useDiscountAuth', () => {
    beforeEach(() => {
        authServiceMock.verifyDiscountAuthorization.mockReset()
    })

    it('inicia sin autorización y con el modal cerrado', () => {
        const { isAuthorized, modalOpen, discountAuthToken } = useDiscountAuth()

        expect(isAuthorized.value).toBe(false)
        expect(modalOpen.value).toBe(false)
        expect(discountAuthToken.value).toBeNull()
    })

    it('openModal abre el modal y limpia el error previo', () => {
        const { openModal, modalOpen, error } = useDiscountAuth()
        error.value = 'error previo'

        openModal()

        expect(modalOpen.value).toBe(true)
        expect(error.value).toBeNull()
    })

    it('closeModal cierra el modal y limpia el error', () => {
        const { openModal, closeModal, modalOpen, error } = useDiscountAuth()
        openModal()
        error.value = 'algo'

        closeModal()

        expect(modalOpen.value).toBe(false)
        expect(error.value).toBeNull()
    })

    it('authorize guarda el token y cierra el modal cuando las credenciales son válidas', async () => {
        authServiceMock.verifyDiscountAuthorization.mockResolvedValue({
            discountAuthToken: 'token-123',
        })
        const { authorize, openModal, modalOpen, isAuthorized, discountAuthToken } =
            useDiscountAuth()
        openModal()

        const result = await authorize('admin', '12345')

        expect(result).toBe(true)
        expect(discountAuthToken.value).toBe('token-123')
        expect(isAuthorized.value).toBe(true)
        expect(modalOpen.value).toBe(false)
        expect(authServiceMock.verifyDiscountAuthorization).toHaveBeenCalledWith({
            username: 'admin',
            userkey: '12345',
        })
    })

    it('authorize deja el error y no autoriza cuando las credenciales son inválidas', async () => {
        authServiceMock.verifyDiscountAuthorization.mockRejectedValue(
            new Error('Credenciales inválidas'),
        )
        const { authorize, isAuthorized, error, discountAuthToken } = useDiscountAuth()

        const result = await authorize('admin', 'mala-clave')

        expect(result).toBe(false)
        expect(isAuthorized.value).toBe(false)
        expect(discountAuthToken.value).toBeNull()
        expect(error.value).toBe('Credenciales inválidas')
    })

    it('resetAuthorization limpia el token de autorización', async () => {
        authServiceMock.verifyDiscountAuthorization.mockResolvedValue({
            discountAuthToken: 'token-123',
        })
        const { authorize, resetAuthorization, isAuthorized } = useDiscountAuth()
        await authorize('admin', '12345')
        expect(isAuthorized.value).toBe(true)

        resetAuthorization()

        expect(isAuthorized.value).toBe(false)
    })
})
