import { useMutation, useQuery } from "@tanstack/react-query";
import {
  cancelExitLog,
  confirmExitLog,
  createExitLog,
  fetchExitLogs,
  getExitLog,
  updateExitLog,
  type CreateExitLogBody,
  type UpdateExitLogBody,
} from "./api";

export const useExitLogs = (clinicId: string | null) => {
  return useQuery({
    queryKey: ["exit-logs", clinicId],
    queryFn: fetchExitLogs,
    enabled: !!clinicId,
  });
};

export const useExitLog = (id: string | null) =>
  useQuery({
    queryKey: ["exit-log", id],
    queryFn: () => getExitLog(String(id)),
    enabled: !!id,
  });

export const useCreateExitLog = () =>
  useMutation({
    mutationFn: (payload: CreateExitLogBody) => createExitLog(payload),
  });

export const useUpdateExitLog = () =>
  useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExitLogBody }) =>
      updateExitLog(id, payload),
  });

export const useConfirmExitLog = () =>
  useMutation({
    mutationFn: (id: string) => confirmExitLog(id),
  });

export const useCancelExitLog = () =>
  useMutation({
    mutationFn: (id: string) => cancelExitLog(id),
  });

