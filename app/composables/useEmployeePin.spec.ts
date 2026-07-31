import { beforeEach, describe, expect, it, vi } from 'vitest'

const branchEmployeesServiceMock = vi.hoisted(() => ({
    verifyPin: vi.fn(),
}))

vi.mock('~/services/branch-employees.service', () => ({
    branchEmployeesService: branchEmployeesServiceMock,
}))

import { useEmployeePin } from './useEmployeePin'

describe('useEmployeePin', () => {
    beforeEach(() => {
        branchEmployeesServiceMock.verifyPin.mockReset()
    })

    it('inicia sin token y con el modal cerrado', () => {
        const { employeeActionToken, modalOpen } = useEmployeePin()

        expect(employeeActionToken.value).toBeNull()
        expect(modalOpen.value).toBe(false)
    })

    it('openModal abre el modal y limpia el error previo', () => {
        const { openModal, modalOpen, error } = useEmployeePin()
        error.value = 'error previo'

        openModal()

        expect(modalOpen.value).toBe(true)
        expect(error.value).toBeNull()
    })

    it('verifyPin guarda el token y el nombre, y cierra el modal cuando el PIN es válido', async () => {
        branchEmployeesServiceMock.verifyPin.mockResolvedValue({
            employeeActionToken: 'token-123',
            employeeName: 'María García',
        })
        const { verifyPin, openModal, modalOpen, employeeActionToken, employeeName } =
            useEmployeePin()
        openModal()

        const result = await verifyPin('4821')

        expect(result).toBe(true)
        expect(employeeActionToken.value).toBe('token-123')
        expect(employeeName.value).toBe('María García')
        expect(modalOpen.value).toBe(false)
        expect(branchEmployeesServiceMock.verifyPin).toHaveBeenCalledWith({ pin: '4821' })
    })

    it('verifyPin deja el error y no guarda token cuando el PIN es inválido', async () => {
        branchEmployeesServiceMock.verifyPin.mockRejectedValue(new Error('PIN inválido'))
        const { verifyPin, employeeActionToken, error } = useEmployeePin()

        const result = await verifyPin('0000')

        expect(result).toBe(false)
        expect(employeeActionToken.value).toBeNull()
        expect(error.value).toBe('PIN inválido')
    })

    it('reset limpia el token y el nombre', async () => {
        branchEmployeesServiceMock.verifyPin.mockResolvedValue({
            employeeActionToken: 'token-123',
            employeeName: 'María García',
        })
        const { verifyPin, reset, employeeActionToken, employeeName } = useEmployeePin()
        await verifyPin('4821')

        reset()

        expect(employeeActionToken.value).toBeNull()
        expect(employeeName.value).toBeNull()
    })
})
