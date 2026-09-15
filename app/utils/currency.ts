export function formatMXN(n: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(n || 0);
}

/** Convierte un valor money del backend (ej. "$50.00") a número. */
export function moneyToNumber(raw: string | number | null | undefined): number {
    return Number.parseFloat(String(raw ?? '0').replace(/[^0-9.]/g, '')) || 0;
}