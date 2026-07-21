import { describe, expect, it } from 'vitest'
import { formatCustomerAddress } from './string'
import type { CustomerItem } from '~/types/customer.types'

function buildCustomer(address: CustomerItem['address']): CustomerItem {
    return {
        id: 'c1',
        fullName: 'Cliente de prueba',
        phone: '5555555555',
        alternativePhone: null,
        email: null,
        notes: null,
        isActive: true,
        address,
        createdAt: '',
        updatedAt: '',
    }
}

describe('formatCustomerAddress', () => {
    it('formatea todos los campos separados por coma', () => {
        const customer = buildCustomer({
            id: 'a1',
            street: 'Calle Reforma',
            number: '123',
            neighborhood: 'Roma Norte',
            city: 'CDMX',
            postalCode: null,
            interphoneCode: null,
            betweenStreets: null,
            reference: null,
            notes: null,
            createdAt: '',
            updatedAt: '',
        })

        expect(formatCustomerAddress(customer)).toBe(
            'Calle Reforma, #123, Roma Norte, CDMX',
        )
    })

    it('omite campos nulos sin dejar comas huérfanas', () => {
        const customer = buildCustomer({
            id: 'a1',
            street: 'Calle Reforma',
            number: null,
            neighborhood: null,
            city: 'CDMX',
            postalCode: null,
            interphoneCode: null,
            betweenStreets: null,
            reference: null,
            notes: null,
            createdAt: '',
            updatedAt: '',
        })

        expect(formatCustomerAddress(customer)).toBe('Calle Reforma, CDMX')
    })

    it('retorna cadena vacía por defecto cuando no hay dirección', () => {
        expect(formatCustomerAddress(buildCustomer(null))).toBe('')
    })

    it('retorna cadena vacía por defecto cuando la dirección no tiene calle', () => {
        const customer = buildCustomer({
            id: 'a1',
            street: null,
            number: '123',
            neighborhood: 'Roma Norte',
            city: 'CDMX',
            postalCode: null,
            interphoneCode: null,
            betweenStreets: null,
            reference: null,
            notes: null,
            createdAt: '',
            updatedAt: '',
        })

        expect(formatCustomerAddress(customer)).toBe('')
    })

    it('usa el emptyFallback explícito cuando se pasa', () => {
        expect(
            formatCustomerAddress(buildCustomer(null), { emptyFallback: '—' }),
        ).toBe('—')
    })
})
