import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const productsServiceMock = vi.hoisted(() => ({
    getProducts: vi.fn(),
}))

vi.mock('~/services/products.service', () => ({
    productsService: productsServiceMock,
    getProductImageUrl: vi.fn(),
}))

import { useProductBuilder } from './useProductBuilder'

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
        it('openRefModal abre el modal con el preview de la fila', () => {
            const { orderProducts, addProduct, openRefModal, refModal } = setup()
            addProduct(product())
            orderProducts.value[0]!.referencePreview = 'blob:preview'

            openRefModal(0)

            expect(refModal.open).toBe(true)
            expect(refModal.rowIndex).toBe(0)
            expect(refModal.preview).toBe('blob:preview')
        })

        it('onRefFileChange asigna el archivo y genera un preview', () => {
            const { orderProducts, addProduct, openRefModal, onRefFileChange, refModal } =
                setup()
            addProduct(product())
            openRefModal(0)

            const file = new File(['contenido'], 'foto.png', { type: 'image/png' })
            const createObjectURLSpy = vi
                .spyOn(URL, 'createObjectURL')
                .mockReturnValue('blob:nuevo-preview')
            const input = document.createElement('input')
            input.type = 'file'
            Object.defineProperty(input, 'files', { value: [file] })

            onRefFileChange({ target: input } as unknown as Event)

            expect(orderProducts.value[0]!.referenceFile).toStrictEqual(file)
            expect(orderProducts.value[0]!.referencePreview).toBe('blob:nuevo-preview')
            expect(refModal.preview).toBe('blob:nuevo-preview')

            createObjectURLSpy.mockRestore()
        })

        it('removeRefImage limpia el archivo, preview y withReference', () => {
            const { orderProducts, addProduct, removeRefImage } = setup()
            addProduct(product())
            orderProducts.value[0]!.referenceFile = new File([''], 'x.png')
            orderProducts.value[0]!.referencePreview = 'blob:x'
            orderProducts.value[0]!.withReference = true
            const revokeSpy = vi
                .spyOn(URL, 'revokeObjectURL')
                .mockImplementation(() => { })

            removeRefImage(0)

            expect(orderProducts.value[0]!.referenceFile).toBeNull()
            expect(orderProducts.value[0]!.referencePreview).toBe('')
            expect(orderProducts.value[0]!.withReference).toBe(false)
            expect(revokeSpy).toHaveBeenCalledWith('blob:x')

            revokeSpy.mockRestore()
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
