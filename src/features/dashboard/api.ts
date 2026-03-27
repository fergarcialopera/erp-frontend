import { apiClient } from "@/lib/apiClient";
import { unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import type { DashboardData } from "@/types/models";

export const fetchDashboard = async (): Promise<DashboardData> => {
  const [productsRes, lockersRes, inventoryRes, exitLogsRes] = await Promise.all([
    apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params: { active: true } }),
    apiClient.get(ENDPOINTS.LOCKERS.LIST),
    apiClient.get(ENDPOINTS.INVENTORY.LIST),
    apiClient.get(ENDPOINTS.EXIT_LOGS.LIST),
  ]);

  const products = unwrapList<Record<string, unknown>>(productsRes.data);
  const lockers = unwrapList<Record<string, unknown>>(lockersRes.data);
  const inventory = unwrapList<Record<string, unknown>>(inventoryRes.data);
  const exits = unwrapList<DashboardData["latest_exits"][number]>(exitLogsRes.data);

  const activeProductsCount = products.filter((p) => p.is_active !== false).length;
  const availableLockersCount = lockers.filter((l) => l.is_active !== false).length;
  const hasLowStock = inventory.some((row) => Number(row.qty_available ?? 0) <= 0);
  const latestExits = [...exits]
    .sort(
      (a, b) =>
        new Date(String(b.created_at ?? "")).getTime() -
        new Date(String(a.created_at ?? "")).getTime(),
    )
    .slice(0, 10);

  return {
    active_products_count: activeProductsCount,
    available_lockers_count: availableLockersCount,
    pending_exits_count: latestExits.length,
    has_low_stock: hasLowStock,
    latest_exits: latestExits,
  };
};
