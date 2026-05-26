import { useMemo } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { useAuth } from "@/app/providers/useAuth";
import { useExitLogs } from "@/features/exitLogs/queries";
import { useDraftExitEditor } from "@/features/exitLogs/useDraftExitEditor";
import { OpenDraftExitButton } from "@/features/exitLogs/components/OpenDraftExitButton";
import { ExitStatusBadge } from "@/features/exitLogs/components/ExitStatusBadge";
import { ConfirmExitDialog } from "@/features/dashboard/components/ConfirmExitDialog";
import { StockLocationPicksList } from "@/components/StockLocationDisplay";
import type { ExitLogProductDisplayRow } from "@/types/models";
import { tableCell } from "@/components/tableTypography";

export default function ExitLogsPage() {
  const { clinicId, isRole, canAccessOperations } = useAuth();
  const isStaff = isRole("STAFF");
  const canExecute = canAccessOperations();
  const draftEditor = useDraftExitEditor(clinicId, canExecute);
  const {
    data: records = [],
    isLoading: exitLogsLoading,
    isFetching: exitLogsFetching,
    isError,
    refetch,
  } = useExitLogs(clinicId);

  /** Primera fila visible de cada salida (varios productos comparten exitLogId). */
  const primaryRowExitIds = useMemo(() => {
    const seen = new Set<string>();
    const ids = new Set<string>();
    for (const row of records) {
      if (!seen.has(row.exitLogId)) {
        seen.add(row.exitLogId);
        ids.add(row.exitLogId);
      }
    }
    return ids;
  }, [records]);

  const columns: Column<ExitLogProductDisplayRow>[] = useMemo(() => {
    const base: Column<ExitLogProductDisplayRow>[] = [
      {
        key: "productSku",
        header: "ID PRODUCTO",
        sortable: true,
        hideBelowSm: true,
        render: (o) => (
          <span className={`${tableCell.mono} text-muted-foreground`}>{o.productSku}</span>
        ),
      },
      {
        key: "productName",
        header: "PRODUCTO",
        sortable: true,
        render: (o) => (
          <div className="min-w-0">
            <span className={tableCell.primary}>{o.productName}</span>
            <span className={`sm:hidden block ${tableCell.mono} text-muted-foreground mt-0.5 truncate`}>
              {o.productSku}
            </span>
          </div>
        ),
      },
      {
        key: "totalQuantity",
        header: "CANTIDAD",
        sortable: true,
        render: (o) => <span className={tableCell.numeric}>{o.totalQuantity}</span>,
      },
      {
        key: "locationPicks",
        header: "UBICACIÓN",
        sortable: false,
        hideBelowSm: true,
        render: (o) => <StockLocationPicksList picks={o.locationPicks} />,
      },
      {
        key: "status",
        header: "ESTADO",
        sortable: true,
        render: (o) => <ExitStatusBadge status={o.status} />,
      },
    ];

    if (!isStaff) {
      base.push({
        key: "created_by_name",
        header: "USUARIO",
        sortable: true,
        hideBelowMd: true,
        render: (o) => <span className={tableCell.primary}>{o.created_by_name}</span>,
      });
    }

    base.push(
      {
        key: "created_at",
        header: "REGISTRADO",
        sortable: true,
        hideBelowMd: true,
        render: (o) => (
          <span className={tableCell.muted}>
            {new Date(o.created_at).toLocaleString("es-ES", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ),
      },
      {
        key: "actions",
        header: "ACCIONES",
        className: "text-right w-[110px]",
        render: (o) =>
          o.status?.toUpperCase() === "DRAFT" && canExecute && primaryRowExitIds.has(o.exitLogId) ? (
            <div className="flex justify-end">
              <OpenDraftExitButton
                exitLogId={o.exitLogId}
                loading={draftEditor.openingId === o.exitLogId}
                onOpen={draftEditor.openById}
              />
            </div>
          ) : (
            <span className={tableCell.muted}>—</span>
          ),
      },
    );

    return base;
  }, [canExecute, draftEditor.openById, draftEditor.openingId, isStaff, primaryRowExitIds]);

  const isLoading = exitLogsLoading || exitLogsFetching;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">{isStaff ? "Mis salidas de stock" : "Salidas de stock"}</h2>
        <p className="page-description">
          {isStaff
            ? "Historial de salidas que has registrado"
            : "Registro de movimientos de salida de productos"}
        </p>
      </div>

      <DataTable
        data={records}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="productName"
        searchPlaceholder="Buscar por producto..."
        emptyTitle="Sin salidas"
        emptyDescription="No hay movimientos de salida registrados."
      />

      <ConfirmExitDialog
        open={draftEditor.open}
        onOpenChange={draftEditor.setOpen}
        items={draftEditor.items}
        productQuantities={draftEditor.productQuantities}
        quantityErrors={draftEditor.quantityErrors}
        hasQuantityErrors={draftEditor.hasQuantityErrors}
        loading={draftEditor.isConfirming}
        onSetProductQty={draftEditor.setProductQuantity}
        onCancelDrafts={draftEditor.cancelPendingDrafts}
        onConfirm={draftEditor.confirmDrafts}
      />
    </div>
  );
}
