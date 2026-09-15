import type { Ref } from "vue";
import { useToast } from "vue-toastification";

/**
 * Pestañas de fecha compartidas por el kanban de pastelero
 * (pedidos/index.vue) y la lista de reparto del repartidor
 * (pedidos/reparto.vue, Cliente #8): mañana/pasado mañana/todas/rango,
 * como filtros locales sobre un arreglo ya cargado.
 */
export type DeliveryDateTab = "tomorrow" | "dayAfter" | "all" | "range";

export function useDeliveryDateTabs<T>(
  items: Ref<T[]>,
  getDeliveryDate: (item: T) => string,
) {
  const toast = useToast();
  const tab = ref<DeliveryDateTab>("tomorrow");
  const rangeFrom = ref("");
  const rangeTo = ref("");

  function deliveryDateStr(iso: string) {
    if (!iso) return "";
    return iso.split("T")[0];
  }

  const tomorrowStr = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return isoDate(d);
  });

  const dayAfterStr = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return isoDate(d);
  });

  const tomorrowLabel = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  });

  const dayAfterLabel = computed(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  });

  const tomorrowItems = computed(() =>
    items.value.filter(
      (i) => deliveryDateStr(getDeliveryDate(i)) === tomorrowStr.value,
    ),
  );
  const dayAfterItems = computed(() =>
    items.value.filter(
      (i) => deliveryDateStr(getDeliveryDate(i)) === dayAfterStr.value,
    ),
  );

  const rangeError = computed(() => {
    if (rangeFrom.value && rangeTo.value && rangeTo.value < rangeFrom.value)
      return "La fecha de término no puede ser menor a la fecha de inicio.";
    return "";
  });

  watch(rangeError, (newVal, oldVal) => {
    if (newVal && !oldVal) toast.error(newVal);
  });

  const rangeItems = computed(() => {
    if (rangeError.value) return [];
    if (!rangeFrom.value && !rangeTo.value) return [];
    return items.value.filter((i) => {
      const d = deliveryDateStr(getDeliveryDate(i));
      if (rangeFrom.value && d < rangeFrom.value) return false;
      if (rangeTo.value && d > rangeTo.value) return false;
      return true;
    });
  });

  const activeItems = computed(() => {
    switch (tab.value) {
      case "tomorrow":
        return tomorrowItems.value;
      case "dayAfter":
        return dayAfterItems.value;
      case "all":
        return items.value;
      case "range":
        return rangeItems.value;
      default:
        return tomorrowItems.value;
    }
  });

  return {
    tab,
    rangeFrom,
    rangeTo,
    rangeError,
    tomorrowLabel,
    dayAfterLabel,
    tomorrowItems,
    dayAfterItems,
    rangeItems,
    activeItems,
  };
}
