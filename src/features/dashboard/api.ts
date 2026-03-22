import { apiClient } from "@/lib/apiClient";
import { unwrapData } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { DashboardData } from "@/types/models";

/** Respuesta GET /dashboard (lock-erp: pending_dispenses_count, latest_dispenses). */
type DashboardApiPayload = Partial<DashboardData> & {
  pending_dispenses_count?: number;
  latest_dispenses?: DashboardData["latest_orders"];
};

export const fetchDashboard = async (): Promise<DashboardData> => {
  const res = await apiClient.get(ENDPOINTS.DASHBOARD.GET);
  const raw = unwrapData<DashboardApiPayload>(res.data) ?? (res.data as DashboardApiPayload);
  const pending =
    typeof raw?.pending_dispenses_count === "number"
      ? raw.pending_dispenses_count
      : typeof raw?.pending_orders_count === "number"
        ? raw.pending_orders_count
        : 0;
  const latest = Array.isArray(raw?.latest_dispenses)
    ? raw.latest_dispenses
    : Array.isArray(raw?.latest_orders)
      ? raw.latest_orders
      : [];
  return {
    active_products_count:
      typeof raw?.active_products_count === "number" ? raw.active_products_count : 0,
    available_lockers_count:
      typeof raw?.available_lockers_count === "number" ? raw.available_lockers_count : 0,
    pending_orders_count: pending,
    has_low_stock: Boolean(raw?.has_low_stock),
    latest_orders: latest,
  };
};
