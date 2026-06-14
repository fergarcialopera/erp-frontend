import { useQuery } from "@tanstack/react-query";
import { fetchClinics } from "./api";

export const CLINICS_QUERY_KEY = ["platform", "clinics"] as const;

export const useClinics = (enabled = true) => {
  return useQuery({
    queryKey: CLINICS_QUERY_KEY,
    queryFn: fetchClinics,
    enabled,
  });
};
