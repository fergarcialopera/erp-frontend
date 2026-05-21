import { useQuery } from "@tanstack/react-query";
import { fetchLockers, fetchLockerById, fetchLockersTree } from "./api";

export const useLockers = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["lockers", clinicId],
    queryFn: fetchLockers,
    enabled: !!clinicId,
  });
};

export const useLocker = (lockerId: string | null) => {
  return useQuery({
    queryKey: ["lockers", lockerId],
    queryFn: () => fetchLockerById(lockerId!),
    enabled: !!lockerId,
  });
};

export const useLockersTree = (
  clinicId: string | null,
  options?: { enabled?: boolean; activeOnly?: boolean },
) => {
  const activeOnly = options?.activeOnly ?? true;
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: ["lockers", "tree", clinicId, activeOnly],
    queryFn: () =>
      fetchLockersTree(clinicId!, activeOnly ? { active: true } : undefined),
    enabled: !!clinicId && enabled,
  });
};
