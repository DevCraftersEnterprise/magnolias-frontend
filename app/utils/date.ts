export function isoDate(d: Date): string {
    return d.toISOString().split('T')[0]!;
}

export function formatDate(iso: string): string {
    if (!iso) return '-';

    const date = new Date(iso);
    const d = String(date.getUTCDate()).padStart(2, '0');
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const y = date.getUTCFullYear();
    return `${d}/${m}/${y}`;
}