export type EventServicesFlags = {
    dessertTable: boolean;
    cake: boolean;
    cheeseTable: boolean;
    plated: boolean;
    // Cliente #4: dos servicios nuevos.
    trays: boolean;
    snackTable: boolean;
};

/**
 * Única fuente de verdad para los servicios de evento: valor esperado por el
 * backend (EventServiceType) + etiqueta visible + llave del flag en el
 * formulario. Evita repetir este mapeo en crear.vue y editar.vue.
 */
export const EVENT_SERVICE_OPTIONS: {
    key: keyof EventServicesFlags;
    value: string;
    label: string;
}[] = [
        { key: "dessertTable", value: "DESSERT_TABLE", label: "Mesa de Postres" },
        { key: "cake", value: "CAKE", label: "Pastel" },
        { key: "cheeseTable", value: "CHEESE_TABLE", label: "Mesa de Quesos" },
        { key: "plated", value: "PLATED", label: "Platillos" },
        { key: "trays", value: "TRAYS", label: "Charolas" },
        { key: "snackTable", value: "SNACK_TABLE", label: "Mesa de bocadillos" },
    ];

export function defaultEventServicesFlags(): EventServicesFlags {
    return {
        dessertTable: false,
        cake: false,
        cheeseTable: false,
        plated: false,
        trays: false,
        snackTable: false,
    };
}

/** Convierte los checkboxes del formulario al arreglo que espera el backend. */
export function buildEventServicesPayload(flags: EventServicesFlags): string[] {
    return EVENT_SERVICE_OPTIONS.filter((o) => flags[o.key]).map((o) => o.value);
}

/** Convierte el arreglo del backend a los checkboxes del formulario (editar). */
export function parseEventServicesPayload(
    values: string[] | undefined | null,
): EventServicesFlags {
    const flags = defaultEventServicesFlags();
    const set = new Set(values ?? []);
    for (const o of EVENT_SERVICE_OPTIONS) {
        flags[o.key] = set.has(o.value);
    }
    return flags;
}
