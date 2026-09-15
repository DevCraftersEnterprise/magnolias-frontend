import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))
mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useRoute', () => () => ({ meta: {} }))

import AdminLayout from './admin.vue'
import { useAuthUser } from '~/composables/useAuthUser'
import { useBranch } from '~/composables/useBranch'
import { useViewAs } from '~/composables/useViewAs'

function mountLayout() {
    return mount(AdminLayout, {
        global: {
            stubs: {
                LayoutSidebar: true,
                LayoutTopbar: {
                    template: '<button @click="$emit(\'logout\')">logout</button>',
                },
                UiFloatingDownloadButton: true,
            },
        },
    })
}

describe('layouts/admin — logout limpia todo el estado (cliente #7)', () => {
    beforeEach(() => {
        navigateToMock.mockReset()
        document.cookie = 'access_token=abc; path=/'
        document.cookie = 'refresh_token=abc; path=/'
        useAuthUser().user.value = { id: 'u1', username: 'admin', isActive: true, role: 'ADMIN' } as any
        useBranch().branches.value = [{ id: 'branch-1' } as any]
        useBranch().selectedBranch.value = { id: 'branch-1' } as any
        useBranch().bakerBranches.value = [{ id: 'branch-1' } as any]
        useViewAs().viewAsBaker.value = true
        useViewAs().viewAsBakerId.value = 'baker-1'
    })

    it('al cerrar sesión, limpia sucursal/vista-como-pastelero además del usuario y navega a /login', async () => {
        const wrapper = mountLayout()

        await wrapper.find('button').trigger('click')

        expect(useAuthUser().user.value).toBeNull()
        expect(useBranch().branches.value).toEqual([])
        expect(useBranch().selectedBranch.value).toBeNull()
        expect(useBranch().bakerBranches.value).toEqual([])
        expect(useViewAs().viewAsBaker.value).toBe(false)
        expect(useViewAs().viewAsBakerId.value).toBe('')
        expect(navigateToMock).toHaveBeenCalledWith('/login')
    })
})
