export function withPagination(base: string, limit: number, offset: number, extra?: Record<string, any>): string {

    const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
    });

    if (extra) {
        Object.entries(extra).forEach(([k, v]) => {
            if (v === undefined || v === null || v === '') return;
            params.set(k, String(v));
        });
    }

    return `${base}?${params.toString()}`;
}