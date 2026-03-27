import { useMemo } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { useAuth } from "@/app/providers/useAuth";
import { useExitLogs } from "@/features/exitLogs/queries";
import type { ExitLog } from "@/types/models";

/** Helper: texto de producto desde exit log enriquecido o fallback */
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

const baseColumns: Column<ExitLogRow>[] = [
  {
    key: "sku",
    header: "ID PRODUCTO",
    sortable: true,
    render: (o) => (
      <span className="font-mono text-xs text-muted-foreground">
        {exitProductSku(o)}
      </span>
    ),
  },
  {
    key: "product_name",
    header: "PRODUCTO",
    sortable: true,
    render: (o) => (
      <span className="text-sm">{exitProductName(o)}</span>
    ),
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
    render: (o) => (
      <span className="text-sm font-mono">
        {exitLockerDisplay(o)}
      </span>
    ),
  },
  {
    key: "compartment_name",
    header: "COMPARTIMENTO",
    sortable: true,
    render: (o) => (
      <span className="text-sm font-mono">
        {exitCompartmentDisplay(o)}
      </span>
    ),
  },
  {
    key: "requested_by_user_name",
    header: "USUARIO",
    sortable: true,
    render: (o) => (
      <span className="text-sm">{exitRequestedByDisplay(o)}</span>
    ),
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
];

export default function ExitLogsPage() {
  const { clinicId } = useAuth();
  const {
    data: exitLogs = [],
    isLoading: exitLogsLoading,
    isFetching: exitLogsFetching,
    isError,
    refetch,
  } = useExitLogs(clinicId);

  const records: ExitLogRow[] = useMemo(() => {
    const sorted = [...exitLogs].sort(
      (a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime()
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
        columns={baseColumns}
        searchKey="product_name"
        searchPlaceholder="Buscar por producto..."
        emptyTitle="Sin salidas"
        emptyDescription="No hay movimientos de salida registrados."
      />
    </div>
  );
}
