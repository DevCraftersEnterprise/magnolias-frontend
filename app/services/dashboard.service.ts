import { apiFetch } from "./api.client";
import type { OrderStatistics } from "~/types/dashboard.types";

export const dashboardService = {

    getOrderStatus(params: {
        branchId?: string
    }) {
        const q = new URLSearchParams()
        if (params.branchId) q.set('branchId', params.branchId);

        const url = q.entries().toArray().length > 0 ? `/api/orders/stats?${q.toString()}` : '/api/orders/stats';

        return apiFetch<OrderStatistics>(url, {
            method: "GET",
            auth: true
        });
    }
};