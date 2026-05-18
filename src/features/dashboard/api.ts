import { apiClient } from "@/lib/apiClient";
import { unwrapList } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { fetchExitLogs, fetchRecentExitSummaries } from "@/features/exitLogs/api";
import type { DashboardData } from "@/types/models";

const RECENT_EXITS_LIMIT = 5;

export const fetchDashboard = async (): Promise<DashboardData> => {
  const [productsRes, lockersRes, inventoryRes, exitLogHeaders] = await Promise.all([
    apiClient.get(ENDPOINTS.PRODUCTS.LIST, { params: { active: true } }),
    apiClient.get(ENDPOINTS.LOCKERS.LIST),
    apiClient.get(ENDPOINTS.INVENTORY.LIST),
    fetchExitLogs(),
  ]);

  const products = unwrapList<Record<string, unknown>>(productsRes.data);
  const lockers = unwrapList<Record<string, unknown>>(lockersRes.data);
  const inventory = unwrapList<Record<string, unknown>>(inventoryRes.data);

  const activeProductsCount = products.filter((p) => p.is_active !== false).length;
  const availableLockersCount = lockers.filter((l) => l.is_active !== false).length;
  const hasLowStock = inventory.some((row) => Number(row.qty_available ?? 0) <= 0);
  const pendingExitsCount = exitLogHeaders.filter((row) => row.status === "DRAFT").length;
  const latestExits = await fetchRecentExitSummaries(RECENT_EXITS_LIMIT);

  return {
    active_products_count: activeProductsCount,
    available_lockers_count: availableLockersCount,
    pending_exits_count: pendingExitsCount,
    has_low_stock: hasLowStock,
    latest_exits: latestExits,
  };
};
