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

export function formatTime(t: string): string {
    if (!t) return '-';
    const parts = t.split('T')[1]?.split(':') ?? [];
    const h = parseInt(parts[0] ?? '0', 10);

    return `${h % 12 || 12}:${parts[1] ?? '00'} ${h < 12 ? 'AM' : 'PM'}`;
}

export function formatDateTime(iso: string): string {
    if (!iso) return '—';

    const d = new Date(iso);
    const date = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
    const time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;

    return `${date} ${time}`;
}