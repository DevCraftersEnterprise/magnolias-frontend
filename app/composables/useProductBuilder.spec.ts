import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const productsServiceMock = vi.hoisted(() => ({
    getProducts: vi.fn(),
}))

vi.mock('~/services/products.service', () => ({
    productsService: productsServiceMock,
    getProductImageUrl: vi.fn(),
}))

import {
    buildOrderDetailPayload,
    mapTierToPayload,
    useProductBuilder,
    type OrderProductRow,
    type TierRow,
} from './useProductBuilder'

function setup() {
    const colorCatalog = ref<{ id: string; name: string; value: string }[]>([])
    return { colorCatalog, ...useProductBuilder(colorCatalog) }
}

function product(overrides: Record<string, unknown> = {}) {
    return { id: 'product-1', name: 'Pastel', ...overrides }
}

async function flushMicrotasks() {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
}

describe('useProductBuilder', () => {
    beforeEach(() => {
        productsServiceMock.getProducts.mockReset()
    })

    describe('addProduct / removeProduct', () => {
        it('agrega un producto nuevo con valores por defecto', () => {
            const { orderProducts, addProduct } = setup()
            const p = product()

            addProduct(p)

            expect(orderProducts.value).toHaveLength(1)
            expect(orderProducts.value[0]).toMatchObject({
                product: p,
                qty: 1,
                price: 0,
                sizeId: '',
                colorId: '',
            })
        })

        it('si el producto ya está agregado, solo incrementa la cantidad', () => {
            const { orderProducts, addProduct } = setup()
            const p = product()

            addProduct(p)
            addProduct(p)

            expect(orderProducts.value).toHaveLength(1)
            expect(orderProducts.value[0]!.qty).toBe(2)
        })

        it('addProduct limpia la búsqueda', () => {
            const { productQuery, productResults, showProductPanel, addProduct } =
                setup()
            productQuery.value = 'algo'
            productResults.value = [product()]
            showProductPanel.value = true

            addProduct(product())

            expect(productQuery.value).toBe('')
            expect(productResults.value).toEqual([])
            expect(showProductPanel.value).toBe(false)
        })

        it('removeProduct elimina la fila en el índice dado', () => {
            const { orderProducts, addProduct, removeProduct } = setup()
            addProduct(product({ id: 'product-1' }))
            addProduct(product({ id: 'product-2' }))

            removeProduct(0)

            expect(orderProducts.value).toHaveLength(1)
            expect(orderProducts.value[0]!.product.id).toBe('product-2')
        })
    })

    describe('pickColor', () => {
        it('asigna el color a la fila y cierra el selector abierto', () => {
            const { pickColor, openColorPicker } = setup()
            openColorPicker.value = 'row-0'
            const row = { colorId: '' }

            pickColor(row, 'color-1')

            expect(row.colorId).toBe('color-1')
            expect(openColorPicker.value).toBeNull()
        })
    })

    describe('modal de imagen de referencia', () => {
        it('openRefModal abre el modal en la fila indicada', () => {
            const { addProduct, openRefModal, refModal } = setup()
            addProduct(product())

            openRefModal(0)

            expect(refModal.open).toBe(true)
            expect(refModal.rowIndex).toBe(0)
        })

        it('onRefFileChange agrega los archivos seleccionados y genera sus previews', () => {
            const { orderProducts, addProduct, openRefModal, onRefFileChange } =
                setup()
            addProduct(product())
            openRefModal(0)

            const file1 = new File(['a'], 'foto1.png', { type: 'image/png' })
            const file2 = new File(['b'], 'foto2.png', { type: 'image/png' })
            const createObjectURLSpy = vi
                .spyOn(URL, 'createObjectURL')
                .mockReturnValueOnce('blob:preview-1')
                .mockReturnValueOnce('blob:preview-2')
            const input = document.createElement('input')
            input.type = 'file'
            Object.defineProperty(input, 'files', { value: [file1, file2] })

            onRefFileChange({ target: input } as unknown as Event)

            expect(orderProducts.value[0]!.referenceFiles).toStrictEqual([file1, file2])
            expect(orderProducts.value[0]!.referencePreviews).toEqual([
                'blob:preview-1',
                'blob:preview-2',
            ])

            createObjectURLSpy.mockRestore()
        })

        it('onRefFileChange no agrega más archivos de los que caben hasta el máximo', () => {
            const { orderProducts, addProduct, openRefModal, onRefFileChange } =
                setup()
            addProduct(product())
            orderProducts.value[0]!.referenceFiles = Array.from(
                { length: 9 },
                (_, i) => new File([''], `x${i}.png`),
            )
            orderProducts.value[0]!.referencePreviews = Array.from(
                { length: 9 },
                (_, i) => `blob:${i}`,
            )
            openRefModal(0)

            const file1 = new File(['a'], 'foto1.png')
            const file2 = new File(['b'], 'foto2.png')
            const createObjectURLSpy = vi
                .spyOn(URL, 'createObjectURL')
                .mockReturnValue('blob:nuevo')
            const input = document.createElement('input')
            input.type = 'file'
            Object.defineProperty(input, 'files', { value: [file1, file2] })

            onRefFileChange({ target: input } as unknown as Event)

            expect(orderProducts.value[0]!.referenceFiles).toHaveLength(10)

            createObjectURLSpy.mockRestore()
        })

        it('removeRefImageAt quita una imagen puntual sin afectar las demás', () => {
            const { orderProducts, addProduct, removeRefImageAt } = setup()
            addProduct(product())
            orderProducts.value[0]!.referenceFiles = [
                new File([''], 'a.png'),
                new File([''], 'b.png'),
            ]
            orderProducts.value[0]!.referencePreviews = ['blob:a', 'blob:b']
            orderProducts.value[0]!.withReference = true
            const revokeSpy = vi
                .spyOn(URL, 'revokeObjectURL')
                .mockImplementation(() => { })

            removeRefImageAt(0, 0)

            expect(orderProducts.value[0]!.referencePreviews).toEqual(['blob:b'])
            expect(orderProducts.value[0]!.withReference).toBe(true)
            expect(revokeSpy).toHaveBeenCalledWith('blob:a')

            revokeSpy.mockRestore()
        })

        it('removeRefImageAt desactiva withReference cuando ya no quedan imágenes', () => {
            const { orderProducts, addProduct, removeRefImageAt } = setup()
            addProduct(product())
            orderProducts.value[0]!.referenceFiles = [new File([''], 'a.png')]
            orderProducts.value[0]!.referencePreviews = ['blob:a']
            orderProducts.value[0]!.withReference = true
            const revokeSpy = vi
                .spyOn(URL, 'revokeObjectURL')
                .mockImplementation(() => { })

            removeRefImageAt(0, 0)

            expect(orderProducts.value[0]!.withReference).toBe(false)

            revokeSpy.mockRestore()
        })

        it('removeRefImage limpia todos los archivos, previews y withReference', () => {
            const { orderProducts, addProduct, removeRefImage } = setup()
            addProduct(product())
            orderProducts.value[0]!.referenceFiles = [
                new File([''], 'a.png'),
                new File([''], 'b.png'),
            ]
            orderProducts.value[0]!.referencePreviews = ['blob:a', 'blob:b']
            orderProducts.value[0]!.withReference = true
            const revokeSpy = vi
                .spyOn(URL, 'revokeObjectURL')
                .mockImplementation(() => { })

            removeRefImage(0)

            expect(orderProducts.value[0]!.referenceFiles).toEqual([])
            expect(orderProducts.value[0]!.referencePreviews).toEqual([])
            expect(orderProducts.value[0]!.withReference).toBe(false)
            expect(revokeSpy).toHaveBeenCalledTimes(2)

            revokeSpy.mockRestore()
        })
    })

    describe('removeExistingReferenceImage', () => {
        it('quita una imagen existente del servidor sin afectar los archivos nuevos', () => {
            const { orderProducts, addProduct, removeExistingReferenceImage } = setup()
            addProduct(product())
            orderProducts.value[0]!.existingReferenceImages = [
                { id: 'img-1', imageUrl: 'https://cdn/a.png' },
                { id: 'img-2', imageUrl: 'https://cdn/b.png' },
            ]
            orderProducts.value[0]!.referenceFiles = [new File([''], 'c.png')]
            orderProducts.value[0]!.referencePreviews = ['blob:c']
            orderProducts.value[0]!.withReference = true

            removeExistingReferenceImage(0, 'img-1')

            expect(orderProducts.value[0]!.existingReferenceImages).toEqual([
                { id: 'img-2', imageUrl: 'https://cdn/b.png' },
            ])
            expect(orderProducts.value[0]!.withReference).toBe(true)
        })

        it('desactiva withReference si no quedan imágenes existentes ni archivos nuevos', () => {
            const { orderProducts, addProduct, removeExistingReferenceImage } = setup()
            addProduct(product())
            orderProducts.value[0]!.existingReferenceImages = [
                { id: 'img-1', imageUrl: 'https://cdn/a.png' },
            ]
            orderProducts.value[0]!.withReference = true

            removeExistingReferenceImage(0, 'img-1')

            expect(orderProducts.value[0]!.withReference).toBe(false)
        })
    })

    describe('modal de detalle', () => {
        it('detailRow retorna null si no hay fila seleccionada', () => {
            const { detailRow } = setup()
            expect(detailRow.value).toBeNull()
        })

        it('openDetailModal/closeDetailModal controlan el estado del modal', () => {
            const { addProduct, openDetailModal, closeDetailModal, detailModal, detailRow } =
                setup()
            addProduct(product())

            openDetailModal(0)
            expect(detailModal.open).toBe(true)
            expect(detailRow.value?.product.id).toBe('product-1')

            closeDetailModal()
            expect(detailModal.open).toBe(false)
        })

        it('detailRowHasDetails detecta si la fila tiene algún dato de personalización', () => {
            const { orderProducts, addProduct, openDetailModal, detailRowHasDetails } =
                setup()
            addProduct(product())
            openDetailModal(0)

            expect(detailRowHasDetails.value).toBe(false)

            orderProducts.value[0]!.sizeId = '10P'
            expect(detailRowHasDetails.value).toBe(true)
        })
    })

    describe('manejo de pisos (pasteles de 2+ pisos)', () => {
        it('un producto nuevo empieza sin pisos', () => {
            const { orderProducts, addProduct } = setup()
            addProduct(product())

            expect(orderProducts.value[0]).toMatchObject({
                hasTiers: false,
                tiers: [],
            })
        })

        it('setHasTiers(true) inicializa con el mínimo de 2 pisos', () => {
            const { orderProducts, addProduct, setHasTiers, MIN_TIERS } = setup()
            addProduct(product())

            setHasTiers(0, true)

            expect(orderProducts.value[0]!.hasTiers).toBe(true)
            expect(orderProducts.value[0]!.tiers).toHaveLength(MIN_TIERS)
            expect(orderProducts.value[0]!.tiers.map((t) => t.position)).toEqual([
                1, 2,
            ])
        })

        it('setHasTiers(false) limpia los pisos', () => {
            const { orderProducts, addProduct, setHasTiers } = setup()
            addProduct(product())
            setHasTiers(0, true)

            setHasTiers(0, false)

            expect(orderProducts.value[0]!.hasTiers).toBe(false)
            expect(orderProducts.value[0]!.tiers).toEqual([])
        })

        it('addTier agrega un piso adicional con la siguiente posición', () => {
            const { orderProducts, addProduct, setHasTiers, addTier } = setup()
            addProduct(product())
            setHasTiers(0, true)

            addTier(0)

            expect(orderProducts.value[0]!.tiers).toHaveLength(3)
            expect(orderProducts.value[0]!.tiers[2]!.position).toBe(3)
        })

        it('removeTier quita el piso indicado y renumera las posiciones', () => {
            const { orderProducts, addProduct, setHasTiers, addTier, removeTier } =
                setup()
            addProduct(product())
            setHasTiers(0, true)
            addTier(0)

            removeTier(0, 0)

            expect(orderProducts.value[0]!.tiers).toHaveLength(2)
            expect(orderProducts.value[0]!.tiers.map((t) => t.position)).toEqual([
                1, 2,
            ])
        })

        it('cada piso tiene un localId único para usarlo como :key', () => {
            const { orderProducts, addProduct, setHasTiers } = setup()
            addProduct(product())

            setHasTiers(0, true)

            const ids = orderProducts.value[0]!.tiers.map((t) => t.localId)
            expect(new Set(ids).size).toBe(ids.length)
        })
    })

    it('optionLabel resuelve la etiqueta o retorna "—"', () => {
        const { optionLabel, UBICACION_OPTIONS } = setup()

        expect(optionLabel(UBICACION_OPTIONS, 'TOP')).toBe('Arriba')
        expect(optionLabel(UBICACION_OPTIONS, 'no-existe')).toBe('—')
    })

    describe('búsqueda de productos (debounce)', () => {
        beforeEach(() => {
            vi.useFakeTimers()
        })
        afterEach(() => {
            vi.useRealTimers()
        })

        it('limpia resultados de inmediato si la búsqueda queda vacía', async () => {
            const { productQuery, productResults, showProductPanel } = setup()
            productQuery.value = '  '
            await nextTick()

            expect(productResults.value).toEqual([])
            expect(showProductPanel.value).toBe(false)
            expect(productsServiceMock.getProducts).not.toHaveBeenCalled()
        })

        it('busca productos tras 400ms de inactividad', async () => {
            productsServiceMock.getProducts.mockResolvedValue({ items: [product()] })
            const { productQuery, productResults, showProductPanel, productSearching } =
                setup()

            productQuery.value = 'pastel'
            await nextTick()
            vi.advanceTimersByTime(400)
            await flushMicrotasks()

            expect(productsServiceMock.getProducts).toHaveBeenCalledWith(12, 0, {
                name: 'pastel',
                includeHidden: true,
            })
            expect(productResults.value).toEqual([product()])
            expect(showProductPanel.value).toBe(true)
            expect(productSearching.value).toBe(false)
        })

        it('limpia resultados si la búsqueda falla', async () => {
            productsServiceMock.getProducts.mockRejectedValue(new Error('500'))
            const { productQuery, productResults } = setup()

            productQuery.value = 'pastel'
            await nextTick()
            vi.advanceTimersByTime(400)
            await flushMicrotasks()

            expect(productResults.value).toEqual([])
        })
    })
})

function baseTier(overrides: Partial<TierRow> = {}): TierRow {
    return {
        localId: 'tier-1',
        position: 1,
        sizeId: '',
        customSize: '',
        colorId: '',
        breadId: '',
        fillingId: '',
        frostingId: '',
        ...overrides,
    }
}

function baseRow(overrides: Partial<OrderProductRow> = {}): OrderProductRow {
    return {
        product: product() as never,
        qty: 1,
        price: 100,
        sizeId: '',
        colorId: '',
        breadId: '',
        fillingId: '',
        frostingId: '',
        styleId: '',
        withText: false,
        text: '',
        textLocation: 'TOP',
        mangaStyle: '',
        mangaNotes: '',
        customSize: '',
        notes: '',
        withReference: false,
        referenceFiles: [],
        referencePreviews: [],
        existingReferenceImages: [],
        discountPercent: 0,
        hasTiers: false,
        tiers: [],
        ...overrides,
    }
}

describe('mapTierToPayload', () => {
    it('mapea un tier a su payload, numerando la posición desde 1', () => {
        const result = mapTierToPayload(
            baseTier({ sizeId: '30P', breadId: 'bread-1', colorId: 'color-1' }),
            0,
        )

        expect(result).toEqual({
            position: 1,
            productSize: '30P',
            customSize: undefined,
            breadTypeId: 'bread-1',
            fillingId: undefined,
            frostingId: undefined,
            colorId: 'color-1',
        })
    })

    it('incluye customSize solo cuando sizeId es CUSTOM', () => {
        const result = mapTierToPayload(
            baseTier({ sizeId: 'CUSTOM', customSize: '100 personas' }),
            1,
        )

        expect(result.productSize).toBe('CUSTOM')
        expect(result.customSize).toBe('100 personas')
    })
})

describe('buildOrderDetailPayload', () => {
    it('mapea los campos base de un pastel simple (sin pisos)', () => {
        const result = buildOrderDetailPayload(
            baseRow({ sizeId: '20P', breadId: 'bread-1', styleId: 'style-1' }),
        )

        expect(result).toMatchObject({
            productId: 'product-1',
            price: 100,
            quantity: 1,
            productSize: '20P',
            breadTypeId: 'bread-1',
            styleId: 'style-1',
            tiers: undefined,
        })
    })

    it('omite tamaño/color/pan/relleno/cubierta a nivel de fila cuando hasTiers es true', () => {
        const result = buildOrderDetailPayload(
            baseRow({
                hasTiers: true,
                sizeId: '20P',
                breadId: 'bread-1',
                colorId: 'color-1',
                fillingId: 'filling-1',
                frostingId: 'frosting-1',
                tiers: [baseTier(), baseTier({ localId: 'tier-2', position: 2 })],
            }),
        )

        expect(result.productSize).toBeUndefined()
        expect(result.breadTypeId).toBeUndefined()
        expect(result.colorId).toBeUndefined()
        expect(result.fillingId).toBeUndefined()
        expect(result.frostingId).toBeUndefined()
        expect(result.tiers).toHaveLength(2)
    })

    it('conserva la forma (styleId) aunque hasTiers sea true', () => {
        const result = buildOrderDetailPayload(
            baseRow({ hasTiers: true, styleId: 'style-1' }),
        )

        expect(result.styleId).toBe('style-1');
    })

    it('no incluye discountPercent (cada página lo agrega con su propia regla)', () => {
        const result = buildOrderDetailPayload(baseRow());

        expect(result).not.toHaveProperty('discountPercent')
    })
})
