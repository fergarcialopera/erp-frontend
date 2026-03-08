import { useQuery } from "@tanstack/react-query";
import { fetchLockers, fetchLockerById } from "./api";

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
