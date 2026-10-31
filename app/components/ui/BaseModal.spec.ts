import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseModal from './BaseModal.vue'

function mountModal(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    return mount(BaseModal, {
        props: { modelValue: true, ...props },
        slots: {
            title: 'Editar usuario',
            default: '<div data-testid="form-body">Contenido del formulario</div>',
            ...slots,
        },
        global: {
            // BaseModal.vue usa <Teleport to="body">; se stubea para poder
            // consultar su contenido con wrapper.text()/wrapper.find() sin
            // tener que apuntar a document.body.
            stubs: { teleport: true },
        },
    })
}

describe('UiBaseModal', () => {
    it('no renderiza nada si modelValue es false', () => {
        const wrapper = mountModal({ modelValue: false })

        expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    })

    it('renderiza título, subtítulo, contenido y pie cuando modelValue es true', () => {
        const wrapper = mountModal(
            {},
            { title: 'Editar usuario', subtitle: 'Sucursal Centro', footer: '<button>Guardar</button>' },
        )

        expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('Editar usuario')
        expect(wrapper.text()).toContain('Sucursal Centro')
        expect(wrapper.text()).toContain('Contenido del formulario')
        expect(wrapper.text()).toContain('Guardar')
    })

    it('no renderiza el pie si no se pasa el slot footer', () => {
        const wrapper = mountModal()

        expect(wrapper.find('.border-t').exists()).toBe(false)
    })

    it('el panel limita su alto a la ventana y solo el contenido hace scroll (cliente: antes el título y los botones se cortaban sin poder hacer scroll)', () => {
        const wrapper = mountModal({}, { footer: '<button>Guardar</button>' })

        const panel = wrapper.find('[role="dialog"]')
        expect(panel.classes()).toContain('max-h-full')
        expect(panel.classes()).toContain('flex')
        expect(panel.classes()).toContain('flex-col')

        // El título y el pie están fuera del contenedor que hace scroll -
        // siguen visibles aunque el contenido sea más alto que la ventana.
        // (.min-h-0.overflow-y-auto identifica el body; el wrapper exterior
        // también tiene overflow-y-auto, pero no min-h-0).
        const scrollableBody = wrapper.find('.min-h-0.overflow-y-auto')
        expect(scrollableBody.exists()).toBe(true)
        expect(scrollableBody.text()).toContain('Contenido del formulario')
        expect(scrollableBody.text()).not.toContain('Editar usuario')
        expect(scrollableBody.text()).not.toContain('Guardar')
    })

    it('emite update:modelValue en false al hacer click en "Cerrar"', async () => {
        const wrapper = mountModal()

        await wrapper.find('[aria-label="Cerrar"]').trigger('click')

        expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    })

    it('emite update:modelValue en false al hacer click en el overlay', async () => {
        const wrapper = mountModal()

        await wrapper.find('.bg-black\\/50').trigger('click')

        expect(wrapper.emitted('update:modelValue')).toEqual([[false]])
    })
})
