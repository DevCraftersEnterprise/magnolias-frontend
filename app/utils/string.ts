export function capitalize(str: string): string {
    return str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function formatPhone(raw: string | null | undefined): string {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');

    if (digits.length === 10) {
        return `+52 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }

    return raw;
}

export function normalizeError(error: any, fallback: string): string {
    const data = error?.data ?? error?.response?._data ?? error?.response?.data;

    if (Array.isArray(data)) return data.join(',');
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
        const firstValue = Object.values(data)[0];
        if (Array.isArray(firstValue)) return String(firstValue[0] ?? fallback);
        if (typeof firstValue === 'string') return firstValue;
    }

    return error?.message || fallback;
}