import { useQuery } from "@tanstack/react-query";
import {
  fetchClinicAmbientes,
  fetchClinicById,
  fetchClinicProducts,
  fetchClinics,
  fetchClinicUsers,
  fetchClinicUsersAvailable,
  type ClinicProductsQuery,
  type ClinicUsersQuery,
} from "./api";

export const CLINICS_QUERY_KEY = ["platform", "clinics"] as const;

export const clinicQueryKey = (clinicId: string) =>
  [...CLINICS_QUERY_KEY, clinicId] as const;

export const clinicUsersQueryKey = (clinicId: string) =>
  [...clinicQueryKey(clinicId), "users"] as const;

export const clinicUsersAvailableQueryKey = (clinicId: string) =>
  [...clinicQueryKey(clinicId), "users", "available"] as const;

export const clinicAmbientesQueryKey = (clinicId: string) =>
  [...clinicQueryKey(clinicId), "ambientes"] as const;

export const clinicProductsQueryKey = (clinicId: string) =>
  [...clinicQueryKey(clinicId), "products"] as const;

export const useClinics = (enabled = true) => {
  return useQuery({
    queryKey: CLINICS_QUERY_KEY,
    queryFn: fetchClinics,
    enabled,
  });
};

export const useClinic = (clinicId: string | undefined) => {
  return useQuery({
    queryKey: clinicQueryKey(clinicId ?? ""),
    queryFn: () => fetchClinicById(clinicId!),
    enabled: !!clinicId,
  });
};

export const useClinicUsers = (clinicId: string | undefined, params?: ClinicUsersQuery) => {
  return useQuery({
    queryKey: [...clinicUsersQueryKey(clinicId ?? ""), params ?? {}],
    queryFn: () => fetchClinicUsers(clinicId!, params),
    enabled: !!clinicId,
  });
};

export const useClinicUsersAvailable = (
  clinicId: string | undefined,
  params?: { search?: string },
  enabled = true,
) => {
  return useQuery({
    queryKey: [...clinicUsersAvailableQueryKey(clinicId ?? ""), params ?? {}],
    queryFn: () => fetchClinicUsersAvailable(clinicId!, params),
    enabled: !!clinicId && enabled,
  });
};

export const useClinicAmbientes = (
  clinicId: string | undefined,
  params?: { active?: boolean },
) => {
  return useQuery({
    queryKey: [...clinicAmbientesQueryKey(clinicId ?? ""), params ?? {}],
    queryFn: () => fetchClinicAmbientes(clinicId!, params),
    enabled: !!clinicId,
  });
};

export const useClinicProducts = (
  clinicId: string | undefined,
  params?: ClinicProductsQuery,
) => {
  return useQuery({
    queryKey: [...clinicProductsQueryKey(clinicId ?? ""), params ?? {}],
    queryFn: () => fetchClinicProducts(clinicId!, params),
    enabled: !!clinicId,
  });
};
