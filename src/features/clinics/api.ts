import { apiClient } from "@/lib/apiClient";
import { unwrapData } from "@/lib/apiResponse";
import { ENDPOINTS } from "@/config/endpoints";
import { Clinic } from "@/types/models";

export const getMyClinic = async (): Promise<Clinic> => {
  const res = await apiClient.get(ENDPOINTS.CLINIC.GET);
  return unwrapData<Clinic>(res.data);
};
