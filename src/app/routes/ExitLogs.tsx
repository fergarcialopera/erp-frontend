import { useMemo } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { useAuth } from "@/app/providers/useAuth";
import { useExitLogs } from "@/features/exitLogs/queries";
import { useDraftExitEditor } from "@/features/exitLogs/useDraftExitEditor";
import { OpenDraftExitButton } from "@/features/exitLogs/components/OpenDraftExitButton";
import { ExitStatusBadge } from "@/features/exitLogs/components/ExitStatusBadge";
import { ConfirmExitDialog } from "@/features/dashboard/components/ConfirmExitDialog";
import { StockLocationDisplay } from "@/components/StockLocationDisplay";
import { formatStockLocationPlain, resolveStockLocationLabels } from "@/lib/stockLocation";
import type { ExitLog } from "@/types/models";

function exitProductSku(o: ExitLog): string {
  return o.product?.sku ?? o.product_sku ?? o.sku ?? o.product_id ?? "—";
}
function exitProductName(o: ExitLog): string {
  return o.product?.name ?? o.product_name ?? o.sku ?? o.product_id ?? "—";
}
function exitLocationLabels(o: ExitLog) {
  return resolveStockLocationLabels(o.locker, o.compartment, o);
}
function exitRequestedByDisplay(o: ExitLog): string {
  return o.requested_by?.name ?? o.requested_by_user_name ?? o.requested_by_user_id ?? "—";
}

type ExitLogRow = ExitLog;

export default function ExitLogsPage() {
  const { clinicId, isRole, canAccessOperations } = useAuth();
  const isStaff = isRole("STAFF");
  const canExecute = canAccessOperations();
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
      location_label: formatStockLocationPlain(exitLocationLabels(o)),
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

  const columns: Column<ExitLogRow>[] = useMemo(() => {
    const base: Column<ExitLogRow>[] = [
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
        key: "location_label",
        header: "UBICACIÓN",
        sortable: true,
        render: (o) => {
          const labels = exitLocationLabels(o);
          return <StockLocationDisplay locker={labels.locker} compartment={labels.compartment} />;
        },
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
        key: "requested_by_user_name",
        header: "USUARIO",
        sortable: true,
        render: (o) => <span className="text-sm">{exitRequestedByDisplay(o)}</span>,
      });
    }

    base.push(
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
