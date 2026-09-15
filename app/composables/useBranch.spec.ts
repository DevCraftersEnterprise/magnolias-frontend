import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBranch } from './useBranch'
import { useAuthUser } from './useAuthUser'
import type { AuthUser } from '~/types/auth.types'
import type { BranchResponse } from '~/types/branch.types'

const getBranchesMock = vi.hoisted(() => vi.fn())

vi.mock('~/services/branches.service', () => ({
    branchesService: { getBranches: getBranchesMock },
}))

function branch(overrides: Partial<BranchResponse> = {}): BranchResponse {
    return {
        id: 'branch-1',
        name: 'Morelos',
        address: 'Av. Siempre Viva 123',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        phones: null,
        ...overrides,
    }
}

function setUser(overrides: Partial<AuthUser> = {}) {
    useAuthUser().user.value = {
        id: 'u1',
        username: 'x',
        isActive: true,
        role: 'ADMIN',
        ...overrides,
    } as AuthUser
}

describe('useBranch', () => {
    beforeEach(() => {
        getBranchesMock.mockReset().mockResolvedValue([branch()])
        useBranch().branches.value = []
        useBranch().selectedBranch.value = null
        useBranch().bakerBranches.value = []
        useAuthUser().user.value = null
    })

    describe('loadBranches', () => {
        it('carga las sucursales y no auto-selecciona para ADMIN/SUPER', async () => {
            setUser({ role: 'ADMIN' })

            await useBranch().loadBranches()

            expect(useBranch().branches.value).toEqual([branch()])
            expect(useBranch().selectedBranch.value).toBeNull()
        })

        it('no vuelve a pedir las sucursales si ya estaban cargadas', async () => {
            setUser({ role: 'ADMIN' })
            await useBranch().loadBranches()
            getBranchesMock.mockClear()

            await useBranch().loadBranches()

            expect(getBranchesMock).not.toHaveBeenCalled()
        })
    })

    describe('resetBranch (cliente #7: logout no debe dejar la sucursal de la sesión anterior)', () => {
        it('limpia branches, selectedBranch y bakerBranches', async () => {
            setUser({ role: 'ADMIN' })
            await useBranch().loadBranches()
            useBranch().selectedBranch.value = branch()
            useBranch().bakerBranches.value = [branch()]

            useBranch().resetBranch()

            expect(useBranch().branches.value).toEqual([])
            expect(useBranch().selectedBranch.value).toBeNull()
            expect(useBranch().bakerBranches.value).toEqual([])
        })

        it('permite que loadBranches vuelva a pedir las sucursales para el siguiente usuario', async () => {
            setUser({ role: 'ADMIN' })
            await useBranch().loadBranches()

            useBranch().resetBranch()
            getBranchesMock.mockClear()
            await useBranch().loadBranches()

            expect(getBranchesMock).toHaveBeenCalledTimes(1)
        })
    })
})
