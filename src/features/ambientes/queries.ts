import { useQuery } from "@tanstack/react-query";
import { fetchAmbientes, fetchAmbienteById, fetchAmbientesTree } from "./api";

export const useAmbientes = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["ambientes", clinicId],
    queryFn: fetchAmbientes,
    enabled: !!clinicId,
  });
};

export const useAmbiente = (ambienteId: string | null) => {
  return useQuery({
    queryKey: ["ambientes", ambienteId],
    queryFn: () => fetchAmbienteById(ambienteId!),
    enabled: !!ambienteId,
  });
};

export const useAmbientesTree = (
  clinicId: string | null,
  options?: { enabled?: boolean; activeOnly?: boolean },
) => {
  const activeOnly = options?.activeOnly ?? true;
  const enabled = options?.enabled ?? true;
  return useQuery({
    queryKey: ["ambientes", "tree", clinicId, activeOnly],
    queryFn: () =>
      fetchAmbientesTree(clinicId!, activeOnly ? { active: true } : undefined),
    enabled: !!clinicId && enabled,
  });
};
