import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useOrderPayment } from './useOrderPayment'

describe('useOrderPayment', () => {
    it('calcula subtotal, orderTotal y remaining con los valores por defecto', () => {
        const orderProducts = ref([
            { price: 100, qty: 2 },
            { price: 50, qty: 1 },
        ])
        const { subtotal, orderTotal, remaining, step4 } =
            useOrderPayment(orderProducts)

        expect(subtotal.value).toBe(250)
        expect(orderTotal.value).toBe(250)
        expect(remaining.value).toBe(250)
        expect(step4.paymentType).toBe('EFECTIVO')
        expect(step4.paymentMode).toBe('FULL')
    })

    it('orderTotal suma el costo de servicio', () => {
        const orderProducts = ref([{ price: 100, qty: 1 }])
        const { orderTotal, serviceCost } = useOrderPayment(orderProducts)
        serviceCost.value = 30

        expect(orderTotal.value).toBe(130)
    })

    it('remaining descuenta el anticipo', () => {
        const orderProducts = ref([{ price: 200, qty: 1 }])
        const { remaining, step4 } = useOrderPayment(orderProducts)
        step4.depositAmount = 50

        expect(remaining.value).toBe(150)
    })

    it('subtotal es 0 sin productos', () => {
        const orderProducts = ref([])
        const { subtotal, orderTotal, remaining } = useOrderPayment(orderProducts)

        expect(subtotal.value).toBe(0)
        expect(orderTotal.value).toBe(0)
        expect(remaining.value).toBe(0)
    })

    it('expone PAYMENT_TYPES con las 3 opciones esperadas', () => {
        const { PAYMENT_TYPES } = useOrderPayment(ref([]))

        expect(PAYMENT_TYPES.map((p) => p.value)).toEqual([
            'EFECTIVO',
            'TARJETA',
            'TRANSFERENCIA',
        ])
    })
})
