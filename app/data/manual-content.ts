export interface ManualSubsection {
    id: string
    title: string
    content: string
    tip?: string
    warning?: string
    tableHeaders?: string[]
    tableRows?: string[][]
    steps?: string[]
}

export interface ManualSection {
    id: string
    title: string
    icon: string
    description: string
    badge?: string
    roleAccess?: string[]
    isNew?: boolean
    subsections: ManualSubsection[]
}

export const manualSections: ManualSection[] = [
    // SECCIÓN 1: INTRODUCCIÓN
    {
        id: 'introduccion',
        title: 'Introducción',
        icon: '📖',
        description: 'Conoce el Panel de Administración de Magnolias, cómo acceder y la navegación general del sistema.',
        roleAccess: ['SUPER', 'ADMIN', 'EMPLOYEE', 'ASSISTANT', 'BAKER'],
        subsections: []
    }
]