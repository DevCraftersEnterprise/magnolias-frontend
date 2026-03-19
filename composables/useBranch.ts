import { branchesService, type BranchResponse } from '~/services/branches.service'

export const useBranch = () => {
    const branches = useState<BranchResponse[]>('branches', () => [])
    const selectedBranch = useState<BranchResponse | null>('selected_branch', () => null)

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

            // BAKER u otros: pueden tener varias; pre-seleccionar la primera
            if (user.value?.branches?.length) {
                selectedBranch.value = data.find(b => b.id === user.value!.branches![0].id) ?? null
            }
        } catch (e) {
            console.error('Error loading branches', e)
        }
    }

    return { branches, selectedBranch, loadBranches }
}
