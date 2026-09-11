import { mount, flushPromises } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { defineComponent, h, Suspense } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ordersServiceMock = vi.hoisted(() => ({
    getOrder: vi.fn(),
    updateDetailProductionStatus: vi.fn(),
}))
const catalogsServiceMock = vi.hoisted(() => ({
    getBreadTypes: vi.fn().mockResolvedValue({ items: [] }),
    getFillings: vi.fn().mockResolvedValue({ items: [] }),
    getFrostings: vi.fn().mockResolvedValue({ items: [] }),
    getStyles: vi.fn().mockResolvedValue({ items: [] }),
    getFlowers: vi.fn().mockResolvedValue({ items: [] }),
    getColors: vi.fn().mockResolvedValue([]),
}))
const addressesServiceMock = vi.hoisted(() => ({
    getAddresses: vi.fn().mockResolvedValue([]),
}))
const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }))
const { navigateToMock } = vi.hoisted(() => ({ navigateToMock: vi.fn() }))

vi.mock('~/services/orders.service', () => ({ ordersService: ordersServiceMock }))
vi.mock('~/services/catalogs.service', () => ({ catalogsService: catalogsServiceMock }))
vi.mock('~/services/addresses.service', () => ({ addressesService: addressesServiceMock }))
vi.mock('vue-toastification', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-toastification')>()
    return { ...actual, useToast: () => toastMock }
})

mockNuxtImport('navigateTo', () => navigateToMock)
mockNuxtImport('useRoute', () => () => ({ params: { id: 'order-1' } }))

import DetalleOrderPage from './[id].vue'
import { useAuthUser } from '~/composables/useAuthUser'

function baseOrder(overrides: Record<string, unknown> = {}) {
    return {
        id: 'order-1',
        orderCode: 'PED-0001',
        status: 'CREATED',
        isEvento: false,
        isEnTienda: false,
        deliveryDate: '2026-09-18T00:00:00Z',
        details: [],
        orderFlowers: [],
        ...overrides,
    }
}

async function mountPage() {
    // La página tiene un "await navigateTo(...)" de nivel superior en su
    // <script setup>, lo que la vuelve un componente async: hay que montarla
    // dentro de un <Suspense> para que VTU pueda resolver su setup().
    const Wrapper = defineComponent({
        setup() {
            return () => h(Suspense, null, { default: () => h(DetalleOrderPage) })
        },
    })
    const wrapper = mount(Wrapper, {
        // El lightbox usa <Teleport to="body">; se stubea para poder
        // consultarlo con wrapper.text()/wrapper.find() directamente.
        global: { stubs: { teleport: true } },
    })
    await flushPromises()
    await flushPromises()
    return wrapper
}

describe('pages/admin/pedidos/detalle/[id] (vista pastelero)', () => {
    beforeEach(() => {
        ordersServiceMock.getOrder.mockReset()
        navigateToMock.mockReset()
        useAuthUser().user.value = { id: 'baker-1', username: 'ana', isActive: true, role: 'BAKER' } as any
    })

    it('redirige a /admin/pedidos si el rol efectivo no es BAKER', async () => {
        useAuthUser().user.value = { id: 'a1', username: 'admin', isActive: true, role: 'ADMIN' } as any
        ordersServiceMock.getOrder.mockResolvedValue(baseOrder())

        await mountPage()

        expect(navigateToMock).toHaveBeenCalledWith('/admin/pedidos', { replace: true })
    })

    it('muestra el desglose de cada piso para un pastel de varios niveles', async () => {
        ordersServiceMock.getOrder.mockResolvedValue(
            baseOrder({
                details: [
                    {
                        id: 'd1',
                        quantity: 1,
                        product: { name: 'Personalizado' },
                        tiers: [
                            {
                                position: 1,
                                productSize: 'CUSTOM',
                                customSize: '35 personas',
                                filling: { name: 'Crema pastelera' },
                                frosting: { name: 'Chocolate' },
                                color: { name: 'Vainilla' },
                                breadType: { name: 'Vainilla' },
                            },
                            {
                                position: 2,
                                productSize: '20P',
                                filling: { name: 'Nueces' },
                                frosting: { name: 'Chocolate' },
                                color: { name: 'Vainilla' },
                                breadType: { name: 'Chocolate' },
                            },
                        ],
                    },
                ],
            }),
        )

        const wrapper = await mountPage()

        expect(wrapper.text()).toContain('Piso 1')
        expect(wrapper.text()).toContain('Piso 2')
        expect(wrapper.text()).toContain('35 PERSONAS')
        expect(wrapper.text()).toContain('Crema pastelera')
        expect(wrapper.text()).toContain('Nueces')
        expect(wrapper.text()).toContain('Vainilla')
    })

    it('no muestra el desglose de pisos para un producto de un solo tamaño', async () => {
        ordersServiceMock.getOrder.mockResolvedValue(
            baseOrder({
                details: [
                    {
                        id: 'd1',
                        quantity: 1,
                        product: { name: 'Personalizado' },
                        productSize: '20P',
                        filling: { name: 'Chocolate' },
                    },
                ],
            }),
        )

        const wrapper = await mountPage()

        expect(wrapper.text()).not.toContain('Piso 1')
        expect(wrapper.text()).toContain('Chocolate')
    })

    it('traduce la posición del pompeado en vez de mostrar el valor crudo del enum', async () => {
        ordersServiceMock.getOrder.mockResolvedValue(
            baseOrder({
                details: [
                    {
                        id: 'd1',
                        quantity: 1,
                        product: { name: 'Personalizado' },
                        hasWriting: true,
                        writingText: 'Feliz cumpleaños',
                        pipingLocation: 'TOP_BORDER',
                    },
                ],
            }),
        )

        const wrapper = await mountPage()

        expect(wrapper.text()).toContain('Borde superior')
        expect(wrapper.text()).not.toContain('TOP_BORDER')
    })

    it('muestra el error si falla la carga del pedido', async () => {
        ordersServiceMock.getOrder.mockRejectedValue(new Error('No se pudo cargar'))

        const wrapper = await mountPage()

        expect(wrapper.text()).toContain('No se pudo cargar')
    })

    it('abre el lightbox al hacer click en una imagen de referencia', async () => {
        ordersServiceMock.getOrder.mockResolvedValue(
            baseOrder({
                details: [
                    {
                        id: 'd1',
                        quantity: 1,
                        product: { name: 'Personalizado' },
                        referenceImages: [{ id: 'img-1', imageUrl: 'https://x/img.png' }],
                    },
                ],
            }),
        )

        const wrapper = await mountPage()
        await wrapper.find('button.cursor-zoom-in').trigger('click')

        const lightboxImg = wrapper.find('img[alt="Referencia ampliada"]')
        expect(lightboxImg.exists()).toBe(true)

        // Alterna el zoom haciendo click sobre la imagen ampliada: de 100%
        // (zoom === 1, valor inicial) pasa a 200%.
        expect(wrapper.text()).toContain('100%')
        await lightboxImg.trigger('click')
        expect(wrapper.text()).toContain('200%')
    })
})
