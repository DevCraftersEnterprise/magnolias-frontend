/** 
 * Fechas calendario ancladas en UTC (deliveryDate, pickupDate): se
 * generan como "YYYY-MM-DDT00:00:00Z" y deben leerse con getters UTC
 * para no desplazar el día según la zona horaria del navegador.
*/

export function isoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function formatDate(iso: string): string {
    if (!iso) return '-';

    const date = new Date(iso);
    const d = String(date.getUTCDate()).padStart(2, '0');
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const y = date.getUTCFullYear();
    return `${d}/${m}/${y}`;
}

/** 
 * Timestamps reales de servidor (createdAt/updatedAt de pedidos y
 * pagos): representan un instante real, no un día anclado — se
 * muestran en hora local para que coincidan entre sí y con la hora
 * que efectivamente vivió quien los generó.
*/

export function formatLocalDate(iso: string): string {
    if (!iso) return '-';

    const date = new Date(iso);
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

// Cliente: el resumen de "Crear pedido" siempre mostraba 12:00 AM sin
// importar la hora elegida. formatTime esperaba un datetime ISO completo
// ("...T15:30:00") y cortaba por "T", pero step2.deliveryTime/pickupTime
// (buildTime24) son un "HH:MM" simple, sin "T" - split('T')[1] daba
// undefined y la hora caía siempre a 0. Acepta ambos formatos.
export function formatTime(t: string): string {
    if (!t) return '-';
    const timePart = t.includes('T') ? t.split('T')[1] : t;
    const parts = timePart?.split(':') ?? [];
    const h = parseInt(parts[0] ?? '0', 10);

    return `${h % 12 || 12}:${parts[1] ?? '00'} ${h < 12 ? 'AM' : 'PM'}`;
}

// Cliente: a los usuarios tipo Pastelero se les muestra la hora de entrega
// 2 horas antes de la hora real (no cambia el dato del pedido, solo cómo
// se les presenta en su propia vista, para que tengan margen de sobra).
export function bakerDeliveryTime(t?: string | null): string {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr ?? '0', 10);
    const m = mStr ?? '00';
    const shifted = ((h - 2) % 24 + 24) % 24;
    return `${String(shifted).padStart(2, '0')}:${m}`;
}

export function formatDateTime(iso: string): string {
    if (!iso) return '—';

    const d = new Date(iso);
    const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    return `${date} ${time}`;
}
