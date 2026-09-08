import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCheck } from "lucide-react";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { Switch } from "@/components/ui/switch";
import {
  bulkPatchClinicProductVisibility,
  patchClinicProductSettingsByClinic,
} from "@/features/clinics/api";
import { clinicProductsQueryKey, useClinicProducts } from "@/features/clinics/queries";
import type { Product } from "@/types/models";
import { toast } from "sonner";

type Props = {
  clinicId: string;
};

function resolveVisible(product: Product): boolean {
  return product.is_visible === true;
}

export function ClinicProductsTab({ clinicId }: Props) {
  const queryClient = useQueryClient();
  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useClinicProducts(clinicId);

  const unavailableCount = useMemo(
    () => products.filter((p) => p.is_active && !resolveVisible(p)).length,
    [products],
  );

  const visibilityMutation = useMutation({
    mutationFn: ({ productId, visible }: { productId: string; visible: boolean }) =>
      patchClinicProductSettingsByClinic(clinicId, productId, { visible }),
    onSuccess: (updated) => {
      toast.success(
        updated.is_visible
          ? `«${updated.name}» disponible en la clínica`
          : `«${updated.name}» no disponible en la clínica`,
      );
      queryClient.invalidateQueries({ queryKey: clinicProductsQueryKey(clinicId) });
    },
  });

  const activateAllMutation = useMutation({
    mutationFn: () =>
      bulkPatchClinicProductVisibility(clinicId, {
        visible: true,
        only_active_catalog: true,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: clinicProductsQueryKey(clinicId) });
      if (result.updated === 0) {
        toast.success("Todos los productos activos ya estaban disponibles");
        return;
      }
      toast.success(
        result.updated === 1
          ? "1 producto marcado como disponible"
          : `${result.updated} productos marcados como disponibles`,
      );
    },
  });

  const busy = visibilityMutation.isPending || activateAllMutation.isPending;

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (p) => (
        <div className="min-w-0">
          <span className={tableCell.primary}>{p.name}</span>
          <span className={`sm:hidden block ${tableCell.muted}`}>{p.sku}</span>
        </div>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      hideBelowSm: true,
      render: (p) => <span className={tableCell.mono}>{p.sku}</span>,
    },
    {
      key: "is_active",
      header: "CATÁLOGO",
      render: (p) => (
        <StatusBadge status={p.is_active ? "Activo" : "Inactivo"} type="active" />
      ),
    },
    {
      key: "is_visible",
      header: "DISPONIBLE",
      render: (p) => {
        const visible = resolveVisible(p);
        return (
          <Switch
            checked={visible}
            disabled={busy}
            onCheckedChange={(checked) =>
              visibilityMutation.mutate({ productId: p.id, visible: checked })
            }
            aria-label={
              visible
                ? `${p.name}: disponible. Desactivar`
                : `${p.name}: no disponible. Activar`
            }
          />
        );
      },
    },
  ];

  return (
    <DataTable
      data={products}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => refetch()}
      searchKey="name"
      searchPlaceholder="Buscar producto..."
      emptyTitle="Sin productos"
      emptyDescription="No hay productos en el catálogo."
      headerAction={
        unavailableCount > 0 ? (
          <TableHeaderButton
            label={activateAllMutation.isPending ? "Activando…" : "Activar todos"}
            icon={<CheckCheck />}
            disabled={busy}
            onClick={() => activateAllMutation.mutate()}
          />
        ) : undefined
      }
    />
  );
}
