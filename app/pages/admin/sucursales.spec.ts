import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const branchesServiceMock = vi.hoisted(() => ({
    getBranches: vi.fn().mockResolvedValue([]),
}))

vi.mock('~/services/branches.service', () => ({ branchesService: branchesServiceMock }))

import SucursalesPage from './sucursales.vue'
import { useBranch } from '~/composables/useBranch'

const newBranch = {
    id: 'branch-2',
    name: 'Sucursal Nueva',
    address: 'Calle Falsa 123',
    isActive: true,
} as any

async function mountPage() {
    const wrapper = mount(SucursalesPage, {
        global: {
            stubs: {
                teleport: true,
                BranchCreateModal: {
                    template: '<button class="stub-create" @click="$emit(\'created\', branch)" />',
                    data: () => ({ branch: newBranch }),
                },
            },
        },
    })
    await flushPromises()
    return wrapper
}

describe('pages/admin/sucursales', () => {
    beforeEach(() => {
        branchesServiceMock.getBranches.mockReset().mockResolvedValue([])
        useBranch().branches.value = []
    })

    it('al crear la primera sucursal, actualiza el estado global useBranch() (mismo que lee el Topbar)', async () => {
        const wrapper = await mountPage()
        expect(useBranch().branches.value).toEqual([])

        await wrapper.find('button').trigger('click') // "Agregar sucursal" abre el modal
        await wrapper.find('.stub-create').trigger('click')

        expect(useBranch().branches.value).toEqual([newBranch])
    })

    it('carga las sucursales en el estado global al montar', async () => {
        branchesServiceMock.getBranches.mockResolvedValue([newBranch])

        await mountPage()

        expect(useBranch().branches.value).toEqual([newBranch])
    })
})
