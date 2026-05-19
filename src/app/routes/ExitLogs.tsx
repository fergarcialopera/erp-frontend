import { useMemo } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { useAuth } from "@/app/providers/useAuth";
import { useExitLogs } from "@/features/exitLogs/queries";
import { useDraftExitEditor } from "@/features/exitLogs/useDraftExitEditor";
import { OpenDraftExitButton } from "@/features/exitLogs/components/OpenDraftExitButton";
import { ExitStatusBadge } from "@/features/exitLogs/components/ExitStatusBadge";
import { ConfirmExitDialog } from "@/features/dashboard/components/ConfirmExitDialog";
import type { ExitLog } from "@/types/models";

function exitProductSku(o: ExitLog): string {
  return o.product?.sku ?? o.product_sku ?? o.sku ?? o.product_id ?? "—";
}
function exitProductName(o: ExitLog): string {
  return o.product?.name ?? o.product_name ?? o.sku ?? o.product_id ?? "—";
}
function exitLockerDisplay(o: ExitLog): string {
  return o.locker?.code ?? o.locker_code ?? o.locker?.name ?? o.locker_name ?? o.locker_id ?? "—";
}
function exitCompartmentDisplay(o: ExitLog): string {
  return o.compartment?.code ?? o.compartment_code ?? o.compartment_name ?? o.compartment_id ?? "—";
}
function exitRequestedByDisplay(o: ExitLog): string {
  return o.requested_by?.name ?? o.requested_by_user_name ?? o.requested_by_user_id ?? "—";
}

type ExitLogRow = ExitLog;

export default function ExitLogsPage() {
  const { user, clinicId } = useAuth();
  const canExecute = user?.role === "ADMIN" || user?.role === "TECHNICIAN" || user?.role === "STAFF";
  const draftEditor = useDraftExitEditor(clinicId, canExecute);
  const {
    data: exitLogs = [],
    isLoading: exitLogsLoading,
    isFetching: exitLogsFetching,
    isError,
    refetch,
  } = useExitLogs(clinicId);

  const records: ExitLogRow[] = useMemo(() => {
    const sorted = [...exitLogs].sort(
      (a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime(),
    );
    return sorted.map((o) => ({
      ...o,
      product_name: exitProductName(o),
      product_sku: exitProductSku(o),
      locker_code: exitLockerDisplay(o),
      compartment_code: exitCompartmentDisplay(o),
      requested_by_user_name: exitRequestedByDisplay(o),
    }));
  }, [exitLogs]);

  /** Primera fila visible de cada salida (varias filas comparten el mismo id de borrador). */
  const primaryRowExitIds = useMemo(() => {
    const seen = new Set<string>();
    const ids = new Set<string>();
    for (const row of records) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        ids.add(row.id);
      }
    }
    return ids;
  }, [records]);

  const columns: Column<ExitLogRow>[] = useMemo(
    () => [
      {
        key: "sku",
        header: "ID PRODUCTO",
        sortable: true,
        render: (o) => (
          <span className="font-mono text-xs text-muted-foreground">{exitProductSku(o)}</span>
        ),
      },
      {
        key: "product_name",
        header: "PRODUCTO",
        sortable: true,
        render: (o) => <span className="text-sm">{exitProductName(o)}</span>,
      },
      {
        key: "quantity",
        header: "CANTIDAD",
        sortable: true,
        render: (o) => <span className="tabular-nums">{o.quantity}</span>,
      },
      {
        key: "locker_name",
        header: "LOCKER",
        sortable: true,
        render: (o) => <span className="text-sm font-mono">{exitLockerDisplay(o)}</span>,
      },
      {
        key: "compartment_name",
        header: "COMPARTIMENTO",
        sortable: true,
        render: (o) => <span className="text-sm font-mono">{exitCompartmentDisplay(o)}</span>,
      },
      {
        key: "status",
        header: "ESTADO",
        sortable: true,
        render: (o) => <ExitStatusBadge status={o.status} />,
      },
      {
        key: "requested_by_user_name",
        header: "USUARIO",
        sortable: true,
        render: (o) => <span className="text-sm">{exitRequestedByDisplay(o)}</span>,
      },
      {
        key: "created_at",
        header: "REGISTRADO",
        sortable: true,
        render: (o) => (
          <span className="text-xs text-muted-foreground">
            {new Date(o.created_at ?? "").toLocaleString("es-ES", {
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
          o.status?.toUpperCase() === "DRAFT" && canExecute && primaryRowExitIds.has(o.id) ? (
            <div className="flex justify-end">
              <OpenDraftExitButton
                exitLogId={o.id}
                loading={draftEditor.openingId === o.id}
                onOpen={draftEditor.openById}
              />
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
    ],
    [canExecute, draftEditor.openById, draftEditor.openingId, primaryRowExitIds],
  );

  const isLoading = exitLogsLoading || exitLogsFetching;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Salidas de stock</h2>
        <p className="page-description">Registro de movimientos de salida de productos</p>
      </div>

      <DataTable
        data={records}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="product_name"
        searchPlaceholder="Buscar por producto..."
        emptyTitle="Sin salidas"
        emptyDescription="No hay movimientos de salida registrados."
      />

      <ConfirmExitDialog
        open={draftEditor.open}
        onOpenChange={draftEditor.setOpen}
        items={draftEditor.items}
        loading={draftEditor.isConfirming}
        onSetQty={draftEditor.setItemQty}
        onCancelDrafts={draftEditor.cancelPendingDrafts}
        onConfirm={draftEditor.confirmDrafts}
      />
    </div>
  );
}
