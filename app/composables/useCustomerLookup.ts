import { customersService } from "~/services/customers.service";
import type { CreateCustomerRequest, CustomerItem } from "~/types/customer.types";
import { useToast } from "vue-toastification";

export function useCustomerLookup() {
    const toast = useToast();
    const selectedCustomer = ref<CustomerItem | null>(null);
    const phoneQuery = ref("");
    const searching = ref(false);
    const results = ref<CustomerItem[]>([]);
    const hasSearched = ref(false);

    async function searchByPhone() {
        const digits = phoneQuery.value.replace(/\D/g, "").trim();
        if (!digits) return;
        searching.value = true;
        hasSearched.value = true;
        try {
            const data = await customersService.getCustomers({ phone: digits, isActive: true, limit: 10 });
            results.value = data.items ?? [];
        } catch (e: any) {
            toast.error(e?.message || "Error al buscar.");
            results.value = [];
        } finally {
            searching.value = false;
        }
    }

    function selectCustomer(c: CustomerItem) {
        selectedCustomer.value = c;
    }

    function formatCustomerAddress(c: CustomerItem) {
        const a = c.address;
        if (!a?.street) return "";
        return [a.street, a.number ? `#${a.number}` : null, a.neighborhood, a.city]
            .filter(Boolean).join(", ");
    }

    // ── Inline registration ──────────────────────────────────────────────────
    const showRegister = ref(false);
    const registering = ref(false);
    const regForm = reactive({
        fullName: "", phone: "", email: "", notes: "", withAddress: false,
        address: {
            street: "", number: "", neighborhood: "", city: "",
            postalCode: "", interphoneCode: "", betweenStreets: "",
            reference: "", addressNotes: "",
        },
    });

    watch(showRegister, (open) => {
        if (!open) return;
        regForm.phone = phoneQuery.value.trim();
        regForm.fullName = ""; regForm.email = ""; regForm.notes = "";
        regForm.withAddress = false;
        regForm.address = {
            street: "", number: "", neighborhood: "", city: "",
            postalCode: "", interphoneCode: "", betweenStreets: "",
            reference: "", addressNotes: "",
        };
    });

    const canRegister = computed(() => {
        if (!regForm.fullName.trim() || !regForm.phone.trim()) return false;
        if (regForm.withAddress) {
            if (!regForm.address.street.trim()) return false;
            if (!regForm.address.number.trim()) return false;
            if (!regForm.address.neighborhood.trim()) return false;
        }
        return true;
    });

    async function registerAndSelect() {
        if (!canRegister.value) return;
        registering.value = true;
        try {
            const payload: CreateCustomerRequest = {
                fullName: regForm.fullName.trim(),
                phone: regForm.phone.trim(),
                email: regForm.email.trim() || null,
                notes: regForm.notes.trim() || null,
                address: regForm.withAddress ? {
                    street: regForm.address.street.trim(),
                    number: regForm.address.number.trim(),
                    neighborhood: regForm.address.neighborhood.trim(),
                    city: regForm.address.city.trim() || null,
                    postalCode: regForm.address.postalCode.trim() || null,
                    interphoneCode: regForm.address.interphoneCode.trim() || null,
                    betweenStreets: regForm.address.betweenStreets.trim() || null,
                    reference: regForm.address.reference.trim() || null,
                    notes: regForm.address.addressNotes.trim() || null,
                } : null,
            };
            const created = await customersService.createCustomer(payload);
            // Reconstruct address if API omits it
            if (regForm.withAddress && !created.address?.street) {
                (created as any).address = {
                    id: (created as any).address?.id ?? "",
                    street: regForm.address.street.trim(),
                    number: regForm.address.number.trim(),
                    neighborhood: regForm.address.neighborhood.trim(),
                    city: regForm.address.city.trim() || null,
                    postalCode: regForm.address.postalCode.trim() || null,
                    interphoneCode: regForm.address.interphoneCode.trim() || null,
                    betweenStreets: regForm.address.betweenStreets.trim() || null,
                    reference: regForm.address.reference.trim() || null,
                    notes: regForm.address.addressNotes.trim() || null,
                    createdAt: "", updatedAt: "",
                };
            }
            selectedCustomer.value = created;
            results.value = [created];
            hasSearched.value = true;
            phoneQuery.value = created.phone;
            showRegister.value = false;
            toast.success("Cliente registrado correctamente.");
        } catch (e: any) {
            toast.error(e?.message || "No se pudo registrar el cliente.");
        } finally {
            registering.value = false;
        }
    }

    return {
        selectedCustomer, phoneQuery, searching,
        results, hasSearched, searchByPhone, selectCustomer, formatCustomerAddress,
        showRegister, registering, regForm, canRegister, registerAndSelect,
    };
}