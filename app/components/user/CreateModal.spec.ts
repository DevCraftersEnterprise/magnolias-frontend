import { mount, flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const usersServiceMock = vi.hoisted(() => ({
    createUser: vi.fn(),
    updateUser: vi.fn(),
    resetPassword: vi.fn(),
}))
const branchesServiceMock = vi.hoisted(() => ({
    getBranches: vi.fn().mockResolvedValue([]),
}))
const toastMock = vi.hoisted(() => ({
    success: vi.fn(),
    error: vi.fn(),
}))

vi.mock('~/services/users.service', () => ({
    usersService: usersServiceMock,
}))
vi.mock('~/services/branches.service', () => ({
    branchesService: branchesServiceMock,
}))
vi.mock('vue-toastification', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-toastification')>()
    return {
        ...actual,
        useToast: () => toastMock,
    }
})

import UserCreateModal from './CreateModal.vue'

function mountModal(props: Record<string, unknown> = {}) {
    return mount(UserCreateModal, {
        props: {
            mode: 'create',
            user: null,
            ...props,
        },
        global: {
            // UiBaseModal usa <Teleport to="body">; se stubea para poder
            // consultar el contenido del formulario directamente.
            stubs: {
                UiBaseModal: {
                    template:
                        '<div><slot name="title" /><slot name="subtitle" /><slot /><slot name="footer" /></div>',
                },
            },
        },
    })
}

describe('UserCreateModal', () => {
    beforeEach(() => {
        branchesServiceMock.getBranches.mockClear()
    })

    it('ofrece el rol Sucursal (EMPLOYEE) al crear un usuario nuevo', async () => {
        const wrapper = mountModal({ mode: 'create' })
        await flushPromises()

        const options = wrapper.find('select').findAll('option')
        const values = options.map((o) => o.attributes('value'))

        expect(values).toEqual(
            expect.arrayContaining(['ADMIN', 'EMPLOYEE', 'BAKER']),
        )
        const employeeOption = options.find(
            (o) => o.attributes('value') === 'EMPLOYEE',
        )
        expect(employeeOption?.text()).toBe('Sucursal')
    })

    it('también ofrece el rol Sucursal al editar un usuario existente', async () => {
        const wrapper = mountModal({
            mode: 'edit',
            user: {
                id: 'u1',
                name: 'Ana',
                lastname: 'López',
                username: 'ana',
                role: 'EMPLOYEE',
                isActive: true,
            },
        })
        await flushPromises()

        const values = wrapper
            .find('select')
            .findAll('option')
            .map((o) => o.attributes('value'))

        expect(values).toContain('EMPLOYEE')
    })

    it('ofrece el rol Repartidor (DRIVER) y muestra el selector de sucursales múltiples (cliente #8)', async () => {
        const wrapper = mountModal({ mode: 'create' })
        await flushPromises()

        const options = wrapper.find('select').findAll('option')
        const values = options.map((o) => o.attributes('value'))
        expect(values).toContain('DRIVER')

        await wrapper.find('select').setValue('DRIVER')
        await flushPromises()

        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false)
        // Sin sucursales cargadas, se muestra el mensaje de carga en vez del
        // checkbox — igual que para BAKER.
        expect(wrapper.text()).toContain('Cargando sucursales')
        // No debe mostrar los campos exclusivos de BAKER (Área/Especialidad).
        expect(wrapper.text()).not.toContain('Especialidad');
    })

    it('envía branchIds al crear un DRIVER (sin area/specialty)', async () => {
        branchesServiceMock.getBranches.mockResolvedValueOnce([
            { id: 'b1', name: 'Sucursal Centro' },
        ])
        usersServiceMock.createUser.mockResolvedValueOnce({ id: 'u1' })
        const wrapper = mountModal({ mode: 'create' })
        await flushPromises()

        await wrapper.find('select').setValue('DRIVER')
        await flushPromises()

        await wrapper.find('input[type="checkbox"]').setValue(true)
        await wrapper.find('form').trigger('submit.prevent')
        await flushPromises()

        expect(usersServiceMock.createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                role: 'DRIVER',
                branchIds: ['b1'],
            }),
        )
        expect(usersServiceMock.createUser).toHaveBeenCalledWith(
            expect.not.objectContaining({ area: expect.anything() }),
        )
    })
})
