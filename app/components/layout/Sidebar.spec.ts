import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import Sidebar from './Sidebar.vue'
import { useAuthUser } from '~/composables/useAuthUser'
import { useViewAs } from '~/composables/useViewAs'

function setUserRole(role: 'ADMIN' | 'SUPER' | 'BAKER' | 'DRIVER' | 'EMPLOYEE') {
    useAuthUser().user.value = {
        id: 'u1',
        username: 'ana',
        isActive: true,
        role,
    } as any
}

function mountSidebar() {
    return mount(Sidebar, {
        global: {
            stubs: {
                NuxtLink: {
                    props: ['to'],
                    template: '<a :href="to"><slot /></a>',
                },
            },
        },
    })
}

describe('Sidebar', () => {
    beforeEach(() => {
        useAuthUser().user.value = null
        useViewAs().viewAsBaker.value = false
        useViewAs().viewAsDriver.value = false
    })

    it('muestra únicamente "Reparto" para un DRIVER (cliente #8)', () => {
        setUserRole('DRIVER')
        const wrapper = mountSidebar()

        const labels = wrapper.find('nav').findAll('a').map((a) => a.text())
        expect(labels).toEqual(['Reparto'])
    })

    it('muestra únicamente "Pedidos" para un BAKER', () => {
        setUserRole('BAKER')
        const wrapper = mountSidebar()

        const labels = wrapper.find('nav').findAll('a').map((a) => a.text())
        expect(labels).toEqual(['Pedidos'])
    })

    it('no muestra "Reparto" para ADMIN/SUPER (solo lo ven los repartidores)', () => {
        setUserRole('ADMIN')
        const wrapper = mountSidebar()

        expect(wrapper.text()).not.toContain('Reparto')
        expect(wrapper.text()).toContain('Pedidos')
    })

    it('enlaza el logo a /admin/pedidos/reparto cuando se previsualiza como repartidor', async () => {
        setUserRole('ADMIN')
        const wrapper = mountSidebar()

        useViewAs().viewAsDriver.value = true
        await wrapper.vm.$nextTick()

        const logoLink = wrapper.find('a[href="/admin/pedidos/reparto"]')
        expect(logoLink.exists()).toBe(true)
    })
})
