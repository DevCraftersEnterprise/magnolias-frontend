export type BranchEmployeeItem = {
    id: string
    name: string
    lastname: string
    isActive: boolean
    branch?: { id: string; name: string }
    createdAt: string
    updatedAt: string
}

export type BranchEmployeesResponse = {
    items: BranchEmployeeItem[]
    total: number
    pagination: {
        limit: number
        offset: number
        totalPages: number
        currentPage: number
    }
}

export type CreateBranchEmployeePayload = {
    name: string
    lastname: string
    pin: string
    branchId: string
}

export type UpdateBranchEmployeePayload = {
    name?: string
    lastname?: string
    pin?: string
    isActive?: boolean
}

export type VerifyEmployeePinPayload = {
    pin: string
}

export type VerifyEmployeePinResponse = {
    employeeActionToken: string
    employeeName: string
}

export type RegenerateBranchEmployeePinResponse = {
    pin: string
}
