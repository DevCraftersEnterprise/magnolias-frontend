import { moneyToNumber } from "./currency";

/** Precio del elemento de catálogo elegido, para verificar el total en el paso 4. */
export function catalogPrice(arr: { id: string; price?: string }[], id: string): number {
    return moneyToNumber(arr.find(x => x.id === id)?.price);
}
