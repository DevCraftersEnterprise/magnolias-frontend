export const PAYMENT_TYPES = [
    { value: "EFECTIVO", label: "Efectivo" },
    { value: "TARJETA", label: "Tarjeta" },
    { value: "TRANSFERENCIA", label: "Transferencia" },
];

export function useOrderPayment(
    orderProducts: Ref<{ price: number; qty: number; discountPercent?: number }[]>,
) {
    const serviceCost = ref<number>(0);

    const step4 = reactive({
        paymentType: "EFECTIVO",
        paymentMode: "FULL" as "FULL" | "DEPOSIT",
        depositAmount: 0,
        requiresInvoice: false,
    });

    const subtotal = computed(() => orderProducts.value.reduce((s, r) => {
        const lineTotal = r.price * r.qty;
        const discountPercent = r.discountPercent || 0;
        return s + (discountPercent > 0 ? lineTotal * (1 - discountPercent / 100) : lineTotal);
    }, 0));
    const orderTotal = computed(() => subtotal.value + (serviceCost.value || 0));
    const remaining = computed(() => orderTotal.value - (step4.depositAmount || 0));

    return {
        step4, serviceCost,
        subtotal, orderTotal, remaining,
        PAYMENT_TYPES,
    };
}