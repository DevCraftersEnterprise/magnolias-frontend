export type UserRole = 'SUPER' | 'ADMIN' | 'EMPLOYEE' | 'BAKER'

export type UserItem = {
    id: string
    name: string
    lastname: string
    username: string
    role: UserRole | string
    isActive: boolean
    area: string | null
    specialty: string | null
    phone: string | null
    branch?: { id: string; name: string } | null
    branches?: { id: string; name: string }[]
    createdAt: string
    updatedAt: string
}

export type UsersResponse = {
    items: UserItem[]
    total: number
    pagination: {
        limit: number
        offset: number
        totalPages: number
        currentPage: number
    }
}

export type GetUsersParams = {
    name?: string
    lastname?: string
    username?: string
    role?: UserRole | string
    limit?: number
    offset?: number
}

export type CreateUserPayload = {
    name: string
    lastname: string
    username: string
    userkey: string
    role: UserRole | string
    branchId?: string | null
    branchIds?: string[]
    area?: string | null
    specialty?: string | null
}

export type UpdateUserPayload = {
    id: string
    name: string
    lastname: string
    username: string
    userkey?: string
    role: UserRole | string
    branchId?: string | null
    branchIds?: string[]
    area?: string | null
    specialty?: string | null
    isActive: boolean
}