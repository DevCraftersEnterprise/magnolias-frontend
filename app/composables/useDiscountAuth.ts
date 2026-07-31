import { authService } from '~/services/auth.service'

export function useDiscountAuth() {
    const modalOpen = ref(false)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const discountAuthToken = ref<string | null>(null)

    const isAuthorized = computed(() => !!discountAuthToken.value)

    function openModal() {
        error.value = null
        modalOpen.value = true
    }

    function closeModal() {
        modalOpen.value = false
        error.value = null
    }

    async function authorize(username: string, userkey: string): Promise<boolean> {
        loading.value = true
        error.value = null
        try {
            const resp = await authService.verifyDiscountAuthorization({ username, userkey })
            discountAuthToken.value = resp.discountAuthToken
            modalOpen.value = false
            return true
        } catch (e: any) {
            error.value = e?.message || 'No se pudo autorizar el descuento.'
            return false
        } finally {
            loading.value = false
        }
    }

    function resetAuthorization() {
        discountAuthToken.value = null
    }

    return {
        modalOpen, loading, error, discountAuthToken, isAuthorized,
        openModal, closeModal, authorize, resetAuthorization,
    }
}
