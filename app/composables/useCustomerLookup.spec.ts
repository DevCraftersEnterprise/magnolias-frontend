import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const customersServiceMock = vi.hoisted(() => ({
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
}))
const toastMock = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}))

vi.mock('~/services/customers.service', () => ({
    customersService: customersServiceMock,
}))

vi.mock('vue-toastification', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-toastification')>()
    return {
        ...actual,
        useToast: () => toastMock,
    }
})

import { useCustomerLookup } from './useCustomerLookup'

describe('useCustomerLookup', () => {
    beforeEach(() => {
        customersServiceMock.getCustomers.mockReset()
        customersServiceMock.createCustomer.mockReset()
        toastMock.success.mockReset()
        toastMock.error.mockReset()
    })

    describe('searchByPhone', () => {
        it('no busca si el teléfono queda vacío tras limpiar no-dígitos', async () => {
            const { phoneQuery, searchByPhone, hasSearched } = useCustomerLookup()
            phoneQuery.value = '   '

            await searchByPhone()

            expect(customersServiceMock.getCustomers).not.toHaveBeenCalled()
            expect(hasSearched.value).toBe(false)
        })

        it('busca por teléfono y llena los resultados', async () => {
            customersServiceMock.getCustomers.mockResolvedValue({
                items: [{ id: 'c1', fullName: 'Ana' }],
            })
            const { phoneQuery, searchByPhone, results, hasSearched } =
                useCustomerLookup()
            phoneQuery.value = '555-555-5555'

            await searchByPhone()

            expect(customersServiceMock.getCustomers).toHaveBeenCalledWith({
                phone: '5555555555',
                isActive: true,
                limit: 10,
            })
            expect(results.value).toEqual([{ id: 'c1', fullName: 'Ana' }])
            expect(hasSearched.value).toBe(true)
        })

        it('muestra un toast de error y vacía resultados si la búsqueda falla', async () => {
            customersServiceMock.getCustomers.mockRejectedValue(
                new Error('Sin conexión'),
            )
            const { phoneQuery, searchByPhone, results } = useCustomerLookup()
            phoneQuery.value = '5555555555'

            await searchByPhone()

            expect(toastMock.error).toHaveBeenCalledWith('Sin conexión')
            expect(results.value).toEqual([])
        })
    })

    describe('registro inline', () => {
        it('canRegister requiere nombre y teléfono como mínimo', () => {
            const { regForm, canRegister } = useCustomerLookup()
            expect(canRegister.value).toBe(false)

            regForm.fullName = 'Ana'
            regForm.phone = '5555555555'
            expect(canRegister.value).toBe(true)
        })

        it('canRegister exige calle/número/colonia si withAddress es true', () => {
            const { regForm, canRegister } = useCustomerLookup()
            regForm.fullName = 'Ana'
            regForm.phone = '5555555555'
            regForm.withAddress = true

            expect(canRegister.value).toBe(false)

            regForm.address.street = 'Calle 1'
            regForm.address.number = '10'
            regForm.address.neighborhood = 'Centro'

            expect(canRegister.value).toBe(true)
        })

        it('abrir showRegister precarga el teléfono buscado y limpia el resto del formulario', async () => {
            const { phoneQuery, showRegister, regForm } = useCustomerLookup()
            phoneQuery.value = '5555555555'
            regForm.fullName = 'Viejo'

            showRegister.value = true
            await nextTick()

            expect(regForm.phone).toBe('5555555555')
            expect(regForm.fullName).toBe('')
        })

        it('registerAndSelect no hace nada si canRegister es false', async () => {
            const { registerAndSelect } = useCustomerLookup()

            await registerAndSelect()

            expect(customersServiceMock.createCustomer).not.toHaveBeenCalled()
        })

        it('registerAndSelect crea el cliente y lo selecciona', async () => {
            const created = {
                id: 'c1',
                fullName: 'Ana',
                phone: '5555555555',
                address: { street: 'Calle 1' },
            }
            customersServiceMock.createCustomer.mockResolvedValue(created)
            const { regForm, registerAndSelect, selectedCustomer, showRegister, results } =
                useCustomerLookup()
            regForm.fullName = 'Ana'
            regForm.phone = '5555555555'

            await registerAndSelect()

            expect(customersServiceMock.createCustomer).toHaveBeenCalledWith(
                expect.objectContaining({ fullName: 'Ana', phone: '5555555555' }),
            )
            expect(selectedCustomer.value).toEqual(created)
            expect(results.value).toEqual([created])
            expect(showRegister.value).toBe(false)
            expect(toastMock.success).toHaveBeenCalled()
        })

        it('reconstruye la dirección si el API la omite en la respuesta', async () => {
            customersServiceMock.createCustomer.mockResolvedValue({
                id: 'c1',
                fullName: 'Ana',
                phone: '5555555555',
                address: null,
            })
            const { regForm, registerAndSelect, selectedCustomer } =
                useCustomerLookup()
            regForm.fullName = 'Ana'
            regForm.phone = '5555555555'
            regForm.withAddress = true
            regForm.address.street = 'Calle 1'
            regForm.address.number = '10'
            regForm.address.neighborhood = 'Centro'

            await registerAndSelect()

            expect((selectedCustomer.value as any).address).toMatchObject({
                street: 'Calle 1',
                number: '10',
                neighborhood: 'Centro',
            })
        })

        it('muestra un toast de error si falla el registro', async () => {
            customersServiceMock.createCustomer.mockRejectedValue(
                new Error('Teléfono duplicado'),
            )
            const { regForm, registerAndSelect } = useCustomerLookup()
            regForm.fullName = 'Ana'
            regForm.phone = '5555555555'

            await registerAndSelect()

            expect(toastMock.error).toHaveBeenCalledWith('Teléfono duplicado')
        })
    })
})
