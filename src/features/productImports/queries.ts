import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkSetProductImportRowDecision,
  cancelProductImport,
  confirmProductImport,
  fetchProductImport,
  fetchProductImportRows,
  fetchProductImports,
  setProductImportRowDecision,
  uploadProductImport,
} from "./api";
import type {
  ProductImportBulkDecisionBody,
  ProductImportDecision,
  ProductImportListParams,
  ProductImportRowsParams,
  ProductImportSessionStatus,
} from "./types";

export const productImportKeys = {
  all: ["product-imports"] as const,
  list: (params: ProductImportListParams) => [...productImportKeys.all, "list", params] as const,
  detail: (id: string) => [...productImportKeys.all, "detail", id] as const,
  rows: (id: string, params: ProductImportRowsParams) =>
    [...productImportKeys.all, "rows", id, params] as const,
};

const POLLING_STATUSES: ProductImportSessionStatus[] = ["analyzing", "processing"];

export function useProductImports(params: ProductImportListParams = {}) {
  return useQuery({
    queryKey: productImportKeys.list(params),
    queryFn: () => fetchProductImports(params),
  });
}

export function useProductImport(id: string | null) {
  return useQuery({
    queryKey: productImportKeys.detail(id ?? ""),
    queryFn: () => fetchProductImport(String(id)),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && POLLING_STATUSES.includes(status) ? 2000 : false;
    },
  });
}

export function useProductImportRows(id: string | null, params: ProductImportRowsParams = {}) {
  return useQuery({
    queryKey: productImportKeys.rows(id ?? "", params),
    queryFn: () => fetchProductImportRows(String(id), params),
    enabled: !!id,
  });
}

function invalidateImport(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  void queryClient.invalidateQueries({ queryKey: productImportKeys.detail(id) });
  void queryClient.invalidateQueries({ queryKey: [...productImportKeys.all, "rows", id] });
  void queryClient.invalidateQueries({ queryKey: productImportKeys.all });
}

export function useUploadProductImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadProductImport(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productImportKeys.all });
    },
  });
}

export function useSetProductImportRowDecision(importId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rowId, decision }: { rowId: string; decision: ProductImportDecision }) =>
      setProductImportRowDecision(importId, rowId, decision),
    onSuccess: () => invalidateImport(queryClient, importId),
  });
}

export function useBulkSetProductImportRowDecision(importId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductImportBulkDecisionBody) =>
      bulkSetProductImportRowDecision(importId, body),
    onSuccess: () => invalidateImport(queryClient, importId),
  });
}

export function useConfirmProductImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => confirmProductImport(id),
    onSuccess: (detail) => invalidateImport(queryClient, detail.id),
  });
}

export function useCancelProductImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelProductImport(id),
    onSuccess: (_void, id) => invalidateImport(queryClient, id),
  });
}
