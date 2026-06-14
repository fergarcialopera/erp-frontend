import { useQuery } from "@tanstack/react-query";
import type { Role } from "@/types/models";
import { fetchDashboard } from "./api";

export const useDashboard = (clinicId: string | null, role: Role = "STAFF") => {
  return useQuery({
    queryKey: ["dashboard", clinicId, role],
    queryFn: () => fetchDashboard(),
    enabled: !!clinicId,
  });
};
