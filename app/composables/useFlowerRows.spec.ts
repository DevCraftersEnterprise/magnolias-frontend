import { describe, expect, it } from 'vitest'
import { useFlowerRows } from './useFlowerRows'

describe('useFlowerRows', () => {
    it('empieza con una fila vacía', () => {
        const { flowerRows } = useFlowerRows()

        expect(flowerRows.value).toEqual([
            { flowerId: '', colorId: '', quantity: '', note: '' },
        ])
    })

    it('addFlowerRow agrega una fila vacía adicional', () => {
        const { flowerRows, addFlowerRow } = useFlowerRows()

        addFlowerRow()

        expect(flowerRows.value).toHaveLength(2)
    })

    it('removeFlowerRow elimina la fila en el índice dado', () => {
        const { flowerRows, addFlowerRow, removeFlowerRow } = useFlowerRows()
        addFlowerRow()
        flowerRows.value[0]!.flowerId = 'flower-1'

        removeFlowerRow(0)

        expect(flowerRows.value).toHaveLength(1)
        expect(flowerRows.value[0]!.flowerId).toBe('')
    })

    it('removeFlowerRow no elimina la última fila restante', () => {
        const { flowerRows, removeFlowerRow } = useFlowerRows()

        removeFlowerRow(0)

        expect(flowerRows.value).toHaveLength(1)
    })

    it('resetFlowerRows vuelve a una sola fila vacía', () => {
        const { flowerRows, addFlowerRow, resetFlowerRows } = useFlowerRows()
        addFlowerRow()
        addFlowerRow()

        resetFlowerRows()

        expect(flowerRows.value).toEqual([
            { flowerId: '', colorId: '', quantity: '', note: '' },
        ])
    })
})
