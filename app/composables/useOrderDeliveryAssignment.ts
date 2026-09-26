import { usersService } from "~/services/users.service";
import { ordersService } from "~/services/orders.service";
import type { OrderDeliveryAssignment } from "~/types/order.types";
import type { UserItem } from "~/types/user.types";

/**
 * Asignación de repartidor a nivel de pedido completo (Cliente #8): carga
 * los repartidores de una sucursal y expone assignDriver(orderId, driverId)
 * con estado de carga, para usarse desde DetailModal.vue.
 */
export function useOrderDeliveryAssignment() {
  const drivers = ref<UserItem[]>([]);
  const driversLoading = ref(false);
  const assigningOrderId = ref<string | null>(null);

  async function loadDrivers(branchId: string) {
    driversLoading.value = true;
    try {
      drivers.value = await usersService.getDriversByBranch(branchId);
    } finally {
      driversLoading.value = false;
    }
  }

  async function assignDriver(
    orderId: string,
    driverId: string,
  ): Promise<OrderDeliveryAssignment> {
    assigningOrderId.value = orderId;
    try {
      return await ordersService.assignOrderDelivery(orderId, driverId);
    } finally {
      assigningOrderId.value = null;
    }
  }

  return {
    drivers,
    driversLoading,
    assigningOrderId,
    loadDrivers,
    assignDriver,
  };
}
