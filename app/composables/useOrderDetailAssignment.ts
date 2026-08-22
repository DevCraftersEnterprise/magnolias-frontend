import { usersService } from "~/services/users.service";
import { ordersService } from "~/services/orders.service";
import type { OrderLineAssignment } from "~/types/order.types";
import type { UserItem } from "~/types/user.types";

/**
 * Asignación de repostero por línea de producto (Cliente #11): carga los
 * reposteros de una sucursal y expone assignBaker(detailId, bakerId) con
 * estado de carga por línea, para usarse desde DetailModal.vue.
 */
export function useOrderDetailAssignment() {
  const bakers = ref<UserItem[]>([]);
  const bakersLoading = ref(false);
  const assigningDetailId = ref<string | null>(null);

  async function loadBakers(branchId: string) {
    bakersLoading.value = true;
    try {
      bakers.value = await usersService.getBakersByBranch(branchId);
    } finally {
      bakersLoading.value = false;
    }
  }

  async function assignBaker(
    detailId: string,
    bakerId: string,
  ): Promise<OrderLineAssignment> {
    assigningDetailId.value = detailId;
    try {
      return await ordersService.assignOrderDetail(detailId, bakerId);
    } finally {
      assigningDetailId.value = null;
    }
  }

  return { bakers, bakersLoading, assigningDetailId, loadBakers, assignBaker };
}
