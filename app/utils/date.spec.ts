import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { bakerDeliveryTime, formatDate, formatDateTime, formatLocalDate, formatTime, isoDate } from './date'

describe('utils/date', () => {
    const ORIGINAL_TZ = process.env.TZ

    beforeAll(() => {
        process.env.TZ = 'America/Mexico_City' // UTC-6 todo el año (sin horario de verano)
    })

    afterAll(() => {
        process.env.TZ = ORIGINAL_TZ
    })

    describe('formatDate (fecha calendario anclada en UTC)', () => {
        it('formatea usando los componentes UTC del ISO, sin importar la hora local', () => {
            expect(formatDate('2023-10-15T00:00:00.000Z')).toBe('15/10/2023')
        })

        it('retorna "-" si no hay valor', () => {
            expect(formatDate('')).toBe('-')
        })
    })

    describe('formatLocalDate / formatDateTime (timestamps reales de servidor)', () => {
        it('formatLocalDate usa la fecha local, no la UTC', () => {
            // 2023-10-15T02:00:00.000Z en America/Mexico_City (UTC-6) es 2023-10-14 20:00 local
            expect(formatLocalDate('2023-10-15T02:00:00.000Z')).toBe('14/10/2023')
        })

        it('formatDateTime muestra la hora local, no la UTC', () => {
            expect(formatDateTime('2023-10-15T02:00:00.000Z')).toBe('14/10/2023 20:00')
        })

        it('formatDateTime y formatLocalDate coinciden en el mismo instante (antes no coincidían: uno era UTC, el otro local)', () => {
            const iso = '2023-10-15T02:00:00.000Z'
            const [datePart] = formatDateTime(iso).split(' ')
            expect(datePart).toBe(formatLocalDate(iso))
        })

        it('retorna "-"/"—" si no hay valor', () => {
            expect(formatLocalDate('')).toBe('-')
            expect(formatDateTime('')).toBe('—')
        })
    })

    describe('isoDate (cálculo de "mañana"/"pasado mañana" del Kanban)', () => {
        it('usa los componentes locales, no UTC — regresión del bug de corrimiento de día', () => {
            // 2023-10-15T02:00:00.000Z es 2023-10-14 en America/Mexico_City (UTC-6)
            const d = new Date('2023-10-15T02:00:00.000Z')
            expect(isoDate(d)).toBe('2023-10-14')
            // La versión anterior (basada en toISOString/UTC) habría dado un día distinto:
            expect(isoDate(d)).not.toBe(d.toISOString().split('T')[0])
        })
    })

    describe('formatTime', () => {
        it('formatea un datetime ISO completo en formato 12 horas con AM/PM', () => {
            expect(formatTime('2023-10-15T15:30:00')).toBe('3:30 PM')
            expect(formatTime('2023-10-15T00:05:00')).toBe('12:05 AM')
        })

        it('formatea un "HH:MM" simple (cliente: el resumen de Crear pedido siempre mostraba 12:00 AM)', () => {
            // step2.deliveryTime/pickupTime (buildTime24) son "HH:MM" sin "T" -
            // antes split('T')[1] daba undefined y la hora caía siempre a 0.
            expect(formatTime('15:30')).toBe('3:30 PM')
            expect(formatTime('08:00')).toBe('8:00 AM')
            expect(formatTime('00:05')).toBe('12:05 AM')
        })

        it('retorna "-" si no hay valor', () => {
            expect(formatTime('')).toBe('-')
        })
    })

    describe('bakerDeliveryTime (cliente: al pastelero se le muestra la hora de entrega 2h antes)', () => {
        it('resta 2 horas a un "HH:MM"', () => {
            expect(bakerDeliveryTime('15:30')).toBe('13:30')
            expect(bakerDeliveryTime('09:00')).toBe('07:00')
        })

        it('da la vuelta correctamente cuando la resta cruza medianoche', () => {
            expect(bakerDeliveryTime('01:00')).toBe('23:00')
            expect(bakerDeliveryTime('00:15')).toBe('22:15')
        })

        it('ignora los segundos si vienen incluidos ("HH:MM:SS")', () => {
            expect(bakerDeliveryTime('15:30:00')).toBe('13:30')
        })

        it('retorna cadena vacía si no hay valor', () => {
            expect(bakerDeliveryTime('')).toBe('')
            expect(bakerDeliveryTime(null)).toBe('')
            expect(bakerDeliveryTime(undefined)).toBe('')
        })
    })
})
