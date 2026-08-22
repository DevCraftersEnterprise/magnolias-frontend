import { nextTick, ref } from 'vue'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
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

    it('al elegir en tienda, fija pickupBranchId a la sucursal del topbar y pone serviceCost en 0', async () => {
        const { setOrderMode, step2, serviceCost } = setup({ branchId: 'branch-1' })
        serviceCost.value = 99

        setOrderMode('enTienda')
        await nextTick()

        expect(step2.pickupBranchId).toBe('branch-1')
        expect(serviceCost.value).toBe(0)
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

    it('needsDelivery es false sin modo seleccionado o en tienda', () => {
        const { setOrderMode, needsDelivery } = setup()
        expect(needsDelivery.value).toBe(false)

        setOrderMode('enTienda')
        expect(needsDelivery.value).toBe(false)
    })

    it('needsDelivery sigue siendo true en domicilio y false en tienda, sin importar includesFlowers', () => {
        const { setOrderMode, step2, needsDelivery } = setup()
        setOrderMode('domicilio')
        step2.includesFlowers = true
        expect(needsDelivery.value).toBe(true)

        setOrderMode('enTienda')
        expect(needsDelivery.value).toBe(false)
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

    it('deliveryTimeOutOfHours usa un límite distinto para evento (antes de las 7am)', async () => {
        const { setOrderMode, deliveryTimeParts, deliveryTimeOutOfHours } = setup()
        setOrderMode('evento')

        deliveryTimeParts.h = 6
        deliveryTimeParts.p = 'AM'
        await nextTick()
        expect(deliveryTimeOutOfHours.value).toBe(true)

        deliveryTimeParts.h = 8
        deliveryTimeParts.p = 'AM'
        await nextTick()
        expect(deliveryTimeOutOfHours.value).toBe(false)
    })

    it('deliveryTimeOutOfHours usa el rango general (8am-8pm) para otros modos', async () => {
        const { setOrderMode, deliveryTimeParts, deliveryTimeOutOfHours } = setup()
        setOrderMode('domicilio')

        deliveryTimeParts.h = 6
        deliveryTimeParts.p = 'AM'
        await nextTick()
        expect(deliveryTimeOutOfHours.value).toBe(true)

        deliveryTimeParts.h = 10
        deliveryTimeParts.p = 'AM'
        await nextTick()
        expect(deliveryTimeOutOfHours.value).toBe(false)
    })

    it('deliveryTimeWarningMsg cambia según el modo de pedido', () => {
        const { setOrderMode, deliveryTimeWarningMsg } = setup()
        setOrderMode('evento')
        expect(deliveryTimeWarningMsg.value).toContain('evento')

        setOrderMode('domicilio')
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

    it('step2AddressValid es true si no se necesita entrega', () => {
        const { step2AddressValid } = setup()
        expect(step2AddressValid.value).toBe(true)
    })

    it('step2AddressValid es true si se usa la dirección del cliente', () => {
        const { setOrderMode, step2, step2AddressValid } = setup()
        setOrderMode('domicilio')
        step2.useCustomerAddr = true

        expect(step2AddressValid.value).toBe(true)
    })

    it('step2AddressValid es true en evento con dirección común seleccionada', () => {
        const { setOrderMode, step2, step2AddressValid } = setup()
        setOrderMode('evento')
        step2.useCommonAddr = true
        step2.commonAddrId = 'addr-1'

        expect(step2AddressValid.value).toBe(true)
    })

    it('step2AddressValid exige calle/número/colonia para una dirección nueva', () => {
        const { setOrderMode, step2, step2AddressValid } = setup()
        setOrderMode('domicilio')

        expect(step2AddressValid.value).toBe(false)

        step2.newAddr.street = 'Calle 1'
        step2.newAddr.number = '10'
        step2.newAddr.neighborhood = 'Centro'

        expect(step2AddressValid.value).toBe(true)
    })
})

describe('minDeliveryDate', () => {
    const ORIGINAL_TZ = process.env.TZ

    beforeAll(() => {
        process.env.TZ = 'America/Mexico_City' // UTC-6 todo el año
    })

    afterAll(() => {
        process.env.TZ = ORIGINAL_TZ
    })

    it('usa getters locales (isoDate) para calcular "mañana", sin el corrimiento de día de toISOString/UTC', () => {
        vi.useFakeTimers()
        // 2023-10-15T02:00:00Z es 2023-10-14 20:00 en America/Mexico_City (UTC-6)
        vi.setSystemTime(new Date('2023-10-15T02:00:00.000Z'))

        const { minDeliveryDate } = setup()

        // "mañana" en local es 2023-10-15; con el bug de toISOString habría sido 2023-10-16
        expect(minDeliveryDate.value).toBe('2023-10-15')

        vi.useRealTimers()
    })
})

