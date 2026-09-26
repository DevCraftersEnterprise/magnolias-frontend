import { describe, expect, it } from 'vitest'
import { isValidKanbanMove } from './kanbanTransitions'

describe('isValidKanbanMove (cliente: drag-and-drop solo hacia adelante)', () => {
    it('permite PENDING -> IN_PROCESS', () => {
        expect(isValidKanbanMove('PENDING', 'IN_PROCESS')).toBe(true)
    })

    it('permite IN_PROCESS -> DONE', () => {
        expect(isValidKanbanMove('IN_PROCESS', 'DONE')).toBe(true)
    })

    it('rechaza un salto de PENDING directo a DONE', () => {
        expect(isValidKanbanMove('PENDING', 'DONE')).toBe(false)
    })

    it('rechaza un retroceso de IN_PROCESS a PENDING', () => {
        expect(isValidKanbanMove('IN_PROCESS', 'PENDING')).toBe(false)
    })

    it('rechaza un retroceso de DONE a IN_PROCESS', () => {
        expect(isValidKanbanMove('DONE', 'IN_PROCESS')).toBe(false)
    })

    it('rechaza cualquier movimiento desde DONE (columna terminal)', () => {
        expect(isValidKanbanMove('DONE', 'PENDING')).toBe(false)
        expect(isValidKanbanMove('DONE', 'DONE')).toBe(false)
    })

    it('rechaza quedarse en la misma columna', () => {
        expect(isValidKanbanMove('PENDING', 'PENDING')).toBe(false)
        expect(isValidKanbanMove('IN_PROCESS', 'IN_PROCESS')).toBe(false)
    })
})
