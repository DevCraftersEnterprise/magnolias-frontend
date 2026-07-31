import { branchEmployeesService } from '~/services/branch-employees.service'

export function useEmployeePin() {
    const modalOpen = ref(false)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const employeeActionToken = ref<string | null>(null)
    const employeeName = ref<string | null>(null)

    function openModal() {
        error.value = null
        modalOpen.value = true
    }

    function closeModal() {
        modalOpen.value = false
        error.value = null
    }

    async function verifyPin(pin: string): Promise<boolean> {
        loading.value = true
        error.value = null
        try {
            const resp = await branchEmployeesService.verifyPin({ pin })
            employeeActionToken.value = resp.employeeActionToken
            employeeName.value = resp.employeeName
            modalOpen.value = false
            return true
        } catch (e: any) {
            error.value = e?.message || 'PIN inválido.'
            return false
        } finally {
            loading.value = false
        }
    }

    function reset() {
        employeeActionToken.value = null
        employeeName.value = null
    }

    return {
        modalOpen, loading, error, employeeActionToken, employeeName,
        openModal, closeModal, verifyPin, reset,
    }
}
