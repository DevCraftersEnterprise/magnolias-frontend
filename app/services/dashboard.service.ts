import { apiFetch } from "./api.client";

export type OrderStatistics = {
    total: number,
    data: {
        created: number,
        in_process: number,
        done: number,
        delivered: number,
        cancelled: number,
        order_type_counts: {
            personalizado: number;
            vitrina: number;
            evento: number;
            domicilio: number;
        }
    }
}

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