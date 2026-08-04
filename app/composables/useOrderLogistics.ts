import type { CustomerItem } from "~/types/customer.types";

export type OrderModeKey = "domicilio" | "enTienda" | "evento";

export const ORDER_MODES: { key: OrderModeKey; label: string; sub: string; icon: string }[] = [
    { key: "domicilio", label: "Domicilio", sub: "Entrega a domicilio", icon: "delivery" },
    { key: "enTienda", label: "En tienda", sub: "Venta en mostrador", icon: "shop" },
    { key: "evento", label: "Evento", sub: "Evento especial", icon: "event" },
];

export const MINUTE_OPTIONS = ["00", "15", "30", "45"] as const;

export function buildTime24(h12: number, minute: string, period: "AM" | "PM"): string {
    let h = h12 % 12;
    if (period === "PM") h += 12;
    return `${String(h).padStart(2, "0")}:${minute}`;
}

export function parseTime24(t: string): { h: number; m: string; p: "AM" | "PM" } {
    const [hStr, mStr] = t.split(":");
    const h24 = parseInt(hStr ?? "8", 10);
    const m = mStr ?? "00";
    const p = h24 < 12 ? "AM" : "PM";
    const h = h24 % 12 || 12;
    const mNum = parseInt(m, 10);
    const mSnap = MINUTE_OPTIONS.reduce((prev, cur) =>
        Math.abs(parseInt(cur) - mNum) < Math.abs(parseInt(prev) - mNum) ? cur : prev, "00");
    return { h, m: mSnap, p };
}

export function useOrderLogistics(
    selectedCustomer: Ref<CustomerItem | null>,
    topbarBranchId: Ref<string | undefined>,
    serviceCost: Ref<number>,
) {
    const step2 = reactive({
        orderMode: null as OrderModeKey | null,
        isEvento: false,
        isEnTienda: false,
        includesFlowers: false,
        deliveryDate: "", deliveryTime: "", deliveryRound: "",
        useCustomerAddr: false,
        newAddr: {
            street: "", number: "", neighborhood: "", city: "",
            postalCode: "", interphoneCode: "", betweenStreets: "",
            reference: "", deliveryNotes: "",
        },
        receiverName: "", receiverPhone: "",
        interphoneCode: "", reference: "", betweenStreets: "", deliveryNotes: "",
        pickupBranchId: "", pickupDate: "", pickupTime: "",
        eventMontageDate: "", eventExitTime: "",
        eventGuestCount: "" as number | "",
        eventResponsibleName: "",
        eventServices: { dessertTable: false, cake: false, cheeseTable: false, plated: false },
        useCommonAddr: false, commonAddrId: "",
        saveAsCommonAddr: false, commonAddrName: "",
    });

    function setOrderMode(mode: OrderModeKey) {
        step2.orderMode = mode;
        step2.isEvento = mode === "evento";
        step2.isEnTienda = mode === "enTienda";
    }

    watch(() => step2.isEnTienda, (isEnTienda) => {
        if (isEnTienda) {
            step2.pickupBranchId = topbarBranchId.value ?? "";
            serviceCost.value = 0;
        }
    });

    watch(selectedCustomer, (c) => {
        step2.useCustomerAddr = !!c?.address?.street;
    });

    const customerHasAddress = computed(() => !!selectedCustomer.value?.address?.street);
    const customerAddressFormatted = computed(() =>
        selectedCustomer.value ? formatCustomerAddress(selectedCustomer.value) : ""
    );

    const needsDelivery = computed(() =>
        step2.orderMode !== null && !step2.isEnTienda,
    );

    const pickupTimeParts = reactive({ h: 8, m: "00", p: "AM" as "AM" | "PM" });
    const deliveryTimeParts = reactive({ h: 8, m: "00", p: "AM" as "AM" | "PM" });
    const exitTimeParts = reactive({ h: 8, m: "00", p: "AM" as "AM" | "PM" });

    watch(pickupTimeParts, (pts) => { step2.pickupTime = buildTime24(pts.h, pts.m, pts.p); }, { immediate: true });
    watch(deliveryTimeParts, (pts) => { step2.deliveryTime = buildTime24(pts.h, pts.m, pts.p); });
    watch(exitTimeParts, (pts) => { step2.eventExitTime = buildTime24(pts.h, pts.m, pts.p); });

    function timeToMinutes(t: string) {
        if (!t) return -1;
        const [h, m] = t.split(":").map(Number);
        return (h ?? 0) * 60 + (m ?? 0);
    }

    const pickupTimeOutOfHours = computed(() => {
        const m = timeToMinutes(step2.pickupTime);
        return m >= 0 && (m < 480 || m >= 1200);
    });
    const deliveryTimeOutOfHours = computed(() => {
        const m = timeToMinutes(step2.deliveryTime);
        if (m < 0) return false;
        if (step2.isEvento) return m < 420;
        return m < 480 || m >= 1200;
    });
    const deliveryTimeWarningMsg = computed(() =>
        step2.isEvento
            ? "La hora del evento parece muy temprana (antes de las 7:00 AM). ¿Estás seguro?"
            : "La hora seleccionada está fuera del horario de atención (8:00 AM–​7:59 PM). Por favor elige una hora dentro del rango para continuar.",
    );
    const exitTimeOutOfHours = computed(() => {
        const m = timeToMinutes(step2.eventExitTime);
        return m >= 0 && m < 420;
    });

    function onPhoneInput(e: Event, setter: (v: string) => void) {
        const input = e.target as HTMLInputElement;
        const clean = input.value.replace(/\D/g, "").slice(0, 10);
        input.value = clean;
        setter(clean);
    }

    const minDeliveryDate = computed(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return isoDate(d);
    });

    const step2AddressValid = computed(() => {
        if (!needsDelivery.value) return true;
        if (step2.useCustomerAddr) return true;
        if (step2.isEvento && step2.useCommonAddr && step2.commonAddrId) return true;
        return !!(step2.newAddr.street.trim() && step2.newAddr.number.trim() && step2.newAddr.neighborhood.trim());
    });

    return {
        step2, ORDER_MODES, MINUTE_OPTIONS, setOrderMode,
        pickupTimeParts, deliveryTimeParts, exitTimeParts,
        customerHasAddress, customerAddressFormatted, needsDelivery,
        pickupTimeOutOfHours, deliveryTimeOutOfHours, deliveryTimeWarningMsg, exitTimeOutOfHours,
        step2AddressValid, minDeliveryDate, onPhoneInput,
        buildTime24, parseTime24,
    };
}
