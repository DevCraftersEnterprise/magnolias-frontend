import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { buildTime24, parseTime24, useOrderLogistics } from './useOrderLogistics'
import type { CustomerItem } from '~/types/customer.types'

function setup(overrides: { branchId?: string } = {}) {
    const selectedCustomer = ref<CustomerItem | null>(null)
    const topbarBranchId = ref<string | undefined>(overrides.branchId)
    const serviceCost = ref(0)
    const logistics = useOrderLogistics(
        selectedCustomer,
        topbarBranchId,
        serviceCost,
    )
    return { selectedCustomer, topbarBranchId, serviceCost, ...logistics }
}

describe('buildTime24 / parseTime24', () => {
    it('buildTime24 convierte 12h + periodo a 24h', () => {
        expect(buildTime24(8, '30', 'AM')).toBe('08:30')
        expect(buildTime24(8, '30', 'PM')).toBe('20:30')
        expect(buildTime24(12, '00', 'PM')).toBe('12:00')
        expect(buildTime24(12, '00', 'AM')).toBe('00:00')
    })

    it('parseTime24 convierte 24h a partes de 12h', () => {
        expect(parseTime24('14:30')).toEqual({ h: 2, m: '30', p: 'PM' })
        expect(parseTime24('08:00')).toEqual({ h: 8, m: '00', p: 'AM' })
    })

    it('parseTime24 ajusta los minutos a la opción de 15 más cercana', () => {
        expect(parseTime24('08:07')).toEqual({ h: 8, m: '00', p: 'AM' })
        expect(parseTime24('08:50')).toEqual({ h: 8, m: '45', p: 'AM' })
    })
})

describe('useOrderLogistics', () => {
    it('pickupTime se inicializa en 08:00 de inmediato', () => {
        const { step2 } = setup()
        expect(step2.pickupTime).toBe('08:00')
    })

    it('deliveryTime empieza vacío hasta el primer cambio de deliveryTimeParts', async () => {
        const { step2, deliveryTimeParts } = setup()
        expect(step2.deliveryTime).toBe('')

        deliveryTimeParts.h = 10
        await nextTick()

        expect(step2.deliveryTime).toBe('10:00')
    })

    it('al elegir VITRINA, fija pickupBranchId a la sucursal del topbar y pone serviceCost en 0', async () => {
        const { step2, serviceCost } = setup({ branchId: 'branch-1' })
        serviceCost.value = 99

        step2.orderType = 'VITRINA'
        await nextTick()

        expect(step2.pickupBranchId).toBe('branch-1')
        expect(serviceCost.value).toBe(0)
    })

    it('al salir de FLOR, florMode vuelve a "domicilio"', async () => {
        const { step2, florMode } = setup()
        step2.orderType = 'FLOR'
        await nextTick()
        florMode.value = 'vitrina'

        step2.orderType = 'DOMICILIO'
        await nextTick()

        expect(florMode.value).toBe('domicilio')
    })

    it('al seleccionar un cliente, useCustomerAddr refleja si tiene dirección', async () => {
        const { selectedCustomer, step2 } = setup()

        selectedCustomer.value = { address: { street: 'Calle 1' } } as CustomerItem
        await nextTick()
        expect(step2.useCustomerAddr).toBe(true)

        selectedCustomer.value = { address: null } as CustomerItem
        await nextTick()
        expect(step2.useCustomerAddr).toBe(false)
    })

    it('customerHasAddress y customerAddressFormatted reflejan la dirección del cliente', () => {
        const { selectedCustomer, customerHasAddress, customerAddressFormatted } =
            setup()

        selectedCustomer.value = {
            address: {
                street: 'Reforma',
                number: '10',
                neighborhood: 'Centro',
                city: 'CDMX',
            },
        } as CustomerItem

        expect(customerHasAddress.value).toBe(true)
        expect(customerAddressFormatted.value).toBe('Reforma, #10, Centro, CDMX')
    })

    it('needsDelivery es false sin tipo de pedido o en VITRINA', () => {
        const { step2, needsDelivery } = setup()
        expect(needsDelivery.value).toBe(false)

        step2.orderType = 'VITRINA'
        expect(needsDelivery.value).toBe(false)
    })

    it('needsDelivery es false en FLOR modo vitrina, true en FLOR modo domicilio', () => {
        const { step2, florMode, needsDelivery } = setup()
        step2.orderType = 'FLOR'
        florMode.value = 'vitrina'
        expect(needsDelivery.value).toBe(false)

        florMode.value = 'domicilio'
        expect(needsDelivery.value).toBe(true)
    })

    it('pickupTimeOutOfHours detecta horarios antes de las 8am o desde las 8pm', async () => {
        const { pickupTimeParts, pickupTimeOutOfHours } = setup()

        pickupTimeParts.h = 6
        pickupTimeParts.p = 'AM'
        await nextTick()
        expect(pickupTimeOutOfHours.value).toBe(true)

        pickupTimeParts.h = 10
        pickupTimeParts.p = 'AM'
        await nextTick()
        expect(pickupTimeOutOfHours.value).toBe(false)
    })

    it('deliveryTimeOutOfHours usa un límite distinto para EVENTO (antes de las 7am)', async () => {
        const { step2, deliveryTimeParts, deliveryTimeOutOfHours } = setup()
        step2.orderType = 'EVENTO'

        deliveryTimeParts.h = 6
        deliveryTimeParts.p = 'AM'
        await nextTick()
        expect(deliveryTimeOutOfHours.value).toBe(true)

        deliveryTimeParts.h = 8
        deliveryTimeParts.p = 'AM'
        await nextTick()
        expect(deliveryTimeOutOfHours.value).toBe(false)
    })

    it('deliveryTimeOutOfHours usa el rango general (8am-8pm) para otros tipos', async () => {
        const { step2, deliveryTimeParts, deliveryTimeOutOfHours } = setup()
        step2.orderType = 'DOMICILIO'

        deliveryTimeParts.h = 6
        deliveryTimeParts.p = 'AM'
        await nextTick()
        expect(deliveryTimeOutOfHours.value).toBe(true)

        deliveryTimeParts.h = 10
        deliveryTimeParts.p = 'AM'
        await nextTick()
        expect(deliveryTimeOutOfHours.value).toBe(false)
    })

    it('deliveryTimeWarningMsg cambia según el tipo de pedido', () => {
        const { step2, deliveryTimeWarningMsg } = setup()
        step2.orderType = 'EVENTO'
        expect(deliveryTimeWarningMsg.value).toContain('evento')

        step2.orderType = 'DOMICILIO'
        expect(deliveryTimeWarningMsg.value).toContain('horario de atención')
    })

    it('exitTimeOutOfHours detecta salidas antes de las 7am', async () => {
        const { exitTimeParts, exitTimeOutOfHours } = setup()

        exitTimeParts.h = 6
        exitTimeParts.p = 'AM'
        await nextTick()
        expect(exitTimeOutOfHours.value).toBe(true)

        exitTimeParts.h = 8
        exitTimeParts.p = 'AM'
        await nextTick()
        expect(exitTimeOutOfHours.value).toBe(false)
    })

    it('onPhoneInput limpia caracteres no numéricos y trunca a 10 dígitos', () => {
        const { onPhoneInput } = setup()
        const input = document.createElement('input')
        input.value = '55-5555-55550000'
        let captured = ''

        onPhoneInput({ target: input } as unknown as Event, (v) => {
            captured = v
        })

        expect(input.value).toBe('5555555555')
        expect(captured).toBe('5555555555')
    })

    it('CARACTERIZACIÓN: minDeliveryDate usa toISOString (UTC), no getters locales — mismo patrón de bug ya corregido en utils/date.ts#isoDate, pero duplicado aquí sin el fix', () => {
        const { minDeliveryDate } = setup()
        const d = new Date()
        d.setDate(d.getDate() + 1)

        expect(minDeliveryDate.value).toBe(d.toISOString().slice(0, 10))
    })

    it('step2AddressValid es true si no se necesita entrega', () => {
        const { step2AddressValid } = setup()
        expect(step2AddressValid.value).toBe(true)
    })

    it('step2AddressValid es true si se usa la dirección del cliente', () => {
        const { step2, step2AddressValid } = setup()
        step2.orderType = 'DOMICILIO'
        step2.useCustomerAddr = true

        expect(step2AddressValid.value).toBe(true)
    })

    it('step2AddressValid es true en EVENTO con dirección común seleccionada', () => {
        const { step2, step2AddressValid } = setup()
        step2.orderType = 'EVENTO'
        step2.useCommonAddr = true
        step2.commonAddrId = 'addr-1'

        expect(step2AddressValid.value).toBe(true)
    })

    it('step2AddressValid exige calle/número/colonia para una dirección nueva', () => {
        const { step2, step2AddressValid } = setup()
        step2.orderType = 'DOMICILIO'

        expect(step2AddressValid.value).toBe(false)

        step2.newAddr.street = 'Calle 1'
        step2.newAddr.number = '10'
        step2.newAddr.neighborhood = 'Centro'

        expect(step2AddressValid.value).toBe(true)
    })
})
