import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const usersServiceMock = vi.hoisted(() => ({
    getBakersByBranch: vi.fn(),
}))

vi.mock('~/services/users.service', () => ({
    usersService: usersServiceMock,
}))

import Topbar from './Topbar.vue'
import { useAuthUser } from '~/composables/useAuthUser'
import { useBranch } from '~/composables/useBranch'
import { useViewAs } from '~/composables/useViewAs'

function setUserRole(role: 'ADMIN' | 'SUPER' | 'BAKER' | 'EMPLOYEE') {
    useAuthUser().user.value = {
        id: 'u1',
        username: 'ana',
        isActive: true,
        role,
    } as any
}

function mountTopbar(props: Record<string, unknown> = {}) {
    return mount(Topbar, {
        props: { title: 'Pedidos', ...props },
    })
}

describe('Topbar', () => {
    beforeEach(() => {
        usersServiceMock.getBakersByBranch.mockReset().mockResolvedValue([])
        useAuthUser().user.value = null
        useBranch().branches.value = []
        useBranch().selectedBranch.value = null
        useBranch().bakerBranches.value = []
        useViewAs().viewAsBaker.value = false
        useViewAs().viewAsBakerId.value = ''
    })

    it('no muestra el aviso "Viendo como" cuando viewAsBaker está apagado', () => {
        setUserRole('ADMIN')
        const wrapper = mountTopbar()

        expect(wrapper.text()).not.toContain('Viendo como')
    })

    it('carga los reposteros de la sucursal seleccionada al activar "Ver como pastelero"', async () => {
        setUserRole('SUPER')
        useBranch().selectedBranch.value = { id: 'branch-1', name: 'Morelos' } as any
        usersServiceMock.getBakersByBranch.mockResolvedValue([
            { id: 'b1', name: 'María', lastname: 'García' },
        ])
        const wrapper = mountTopbar()

        useViewAs().viewAsBaker.value = true
        await flushPromises()

        expect(usersServiceMock.getBakersByBranch).toHaveBeenCalledWith('branch-1')
        expect(wrapper.text()).toContain('Viendo como')
        const select = wrapper.find('select[aria-label="Selecciona un pastelero para previsualizar"]')
        const options = select.findAll('option')
        expect(options.map((o) => o.text())).toEqual(
            expect.arrayContaining(['María García']),
        )

        await select.setValue('b1')

        expect(useViewAs().viewAsBakerId.value).toBe('b1')
    })

    it('muestra "Sin reposteros en esta sucursal" si la lista viene vacía', async () => {
        setUserRole('ADMIN')
        useBranch().selectedBranch.value = { id: 'branch-1', name: 'Morelos' } as any
        usersServiceMock.getBakersByBranch.mockResolvedValue([])
        mountTopbar()

        useViewAs().viewAsBaker.value = true
        await flushPromises()

        expect(usersServiceMock.getBakersByBranch).toHaveBeenCalled()
    })

    it('vacía la lista de reposteros si falla la carga', async () => {
        setUserRole('ADMIN')
        useBranch().selectedBranch.value = { id: 'branch-1', name: 'Morelos' } as any
        usersServiceMock.getBakersByBranch.mockRejectedValue(new Error('network'))
        mountTopbar()

        useViewAs().viewAsBaker.value = true
        await flushPromises()

        const { viewAsBaker } = useViewAs()
        expect(viewAsBaker.value).toBe(true)
    })

    it('no intenta cargar reposteros si no hay sucursal seleccionada', async () => {
        setUserRole('ADMIN')
        useBranch().selectedBranch.value = null
        mountTopbar()

        useViewAs().viewAsBaker.value = true
        await flushPromises()

        expect(usersServiceMock.getBakersByBranch).not.toHaveBeenCalled()
    })

    it('el checkbox "Ver como pastelero" solo aparece para ADMIN/SUPER', () => {
        setUserRole('BAKER')
        const wrapper = mountTopbar()

        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
    })

    it('activa la vista simulada al marcar el checkbox', async () => {
        setUserRole('ADMIN')
        const wrapper = mountTopbar()

        await wrapper.find('input[type="checkbox"]').setValue(true)

        expect(useViewAs().viewAsBaker.value).toBe(true)
    })

    it('desactiva la vista simulada al desmarcar el checkbox', async () => {
        setUserRole('ADMIN')
        useViewAs().viewAsBaker.value = true
        useViewAs().viewAsBakerId.value = 'baker-1'
        const wrapper = mountTopbar()

        await wrapper.find('input[type="checkbox"]').setValue(false)

        expect(useViewAs().viewAsBaker.value).toBe(false)
        expect(useViewAs().viewAsBakerId.value).toBe('')
    })

    it('el botón "Salir" del aviso sale de la vista simulada', async () => {
        setUserRole('ADMIN')
        useViewAs().viewAsBaker.value = true
        const wrapper = mountTopbar()

        const salirBtn = wrapper.findAll('button').find((b) => b.text() === 'Salir')
        await salirBtn?.trigger('click')

        expect(useViewAs().viewAsBaker.value).toBe(false)
    })

    it('emite toggle y logout', async () => {
        setUserRole('ADMIN')
        const wrapper = mountTopbar()

        await wrapper.find('button[aria-label="Menú"]').trigger('click')
        await wrapper.find('button[title="Cerrar sesión"]').trigger('click')

        expect(wrapper.emitted('toggle')).toBeTruthy()
        expect(wrapper.emitted('logout')).toBeTruthy()
    })

    it('muestra las iniciales del usuario y "Cargando…" mientras carga', () => {
        setUserRole('ADMIN')
        useAuthUser().loading.value = true
        const wrapper = mountTopbar()

        expect(wrapper.text()).toContain('Cargando…')
        useAuthUser().loading.value = false
    })
})
