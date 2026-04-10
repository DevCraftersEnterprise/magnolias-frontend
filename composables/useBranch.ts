import { branchesService, type BranchResponse } from '~/services/branches.service'

export const useBranch = () => {
    const branches = useState<BranchResponse[]>('branches', () => [])
    const selectedBranch = useState<BranchResponse | null>('selected_branch', () => null)
    // Sucursales disponibles para el pastelero (subset de branches)
    const bakerBranches = useState<BranchResponse[]>('baker_branches', () => [])

    async function loadBranches() {
        if (branches.value.length > 0) return
        try {
            const data = await branchesService.getBranches()
            branches.value = data

            const { user } = useAuthUser()
            const role = user.value?.role

            // ADMIN/SUPER: sin auto-selección, el select está disponible
            if (role === 'ADMIN' || role === 'SUPER') return

            // EMPLOYEE: tiene una sola sucursal asignada en `branch`
            if (user.value?.branch?.id) {
                selectedBranch.value = data.find(b => b.id === user.value!.branch!.id) ?? null
                return
            }

            // BAKER: puede tener varias; precargamos su lista y pre-seleccionamos la primera
            if (user.value?.branches?.length) {
                const ids = user.value.branches.map(b => b.id)
                bakerBranches.value = data.filter(b => ids.includes(b.id))
                selectedBranch.value = bakerBranches.value[0] ?? null
            }
        } catch (e) {
            console.error('Error loading branches', e)
        }
    }

    return { branches, selectedBranch, bakerBranches, loadBranches }
}
