import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchAccessAuditLog,
  fetchAccessAuditLogs,
  fetchActivityAuditLog,
  fetchActivityAuditLogs,
} from "./api";
import type { AccessAuditListParams, ActivityAuditListParams } from "@/types/audit";

export const accessAuditQueryKey = (params: AccessAuditListParams) =>
  ["audit", "access", params] as const;

export const activityAuditQueryKey = (params: ActivityAuditListParams) =>
  ["audit", "activity", params] as const;

export const useAccessAuditLogs = (
  params: AccessAuditListParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: accessAuditQueryKey(params),
    queryFn: () => fetchAccessAuditLogs(params),
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
  });
};

export const useActivityAuditLogs = (
  params: ActivityAuditListParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: activityAuditQueryKey(params),
    queryFn: () => fetchActivityAuditLogs(params),
    enabled: options?.enabled !== false,
    placeholderData: keepPreviousData,
  });
};

export const useAccessAuditLogDetail = (id: string | null) => {
  return useQuery({
    queryKey: ["audit", "access", "detail", id],
    queryFn: () => fetchAccessAuditLog(id!),
    enabled: !!id,
  });
};

export const useActivityAuditLogDetail = (id: string | null) => {
  return useQuery({
    queryKey: ["audit", "activity", "detail", id],
    queryFn: () => fetchActivityAuditLog(id!),
    enabled: !!id,
  });
};
