import { apiClient } from "@/lib/apiClient";
import { unwrapData } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { DashboardData } from "@/types/models";

export const fetchDashboard = async (): Promise<DashboardData> => {
  const res = await apiClient.get(ENDPOINTS.DASHBOARD.GET);
  const raw = unwrapData<DashboardData>(res.data);
  return {
    active_products_count: typeof raw?.active_products_count === "number" ? raw.active_products_count : 0,
    available_lockers_count: typeof raw?.available_lockers_count === "number" ? raw.available_lockers_count : 0,
    pending_orders_count: typeof raw?.pending_orders_count === "number" ? raw.pending_orders_count : 0,
    has_low_stock: Boolean(raw?.has_low_stock),
    latest_orders: Array.isArray(raw?.latest_orders) ? raw.latest_orders : [],
  };
};
