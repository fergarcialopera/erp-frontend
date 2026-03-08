import { DataTable, Column } from "@/components/DataTable";
import { useAuth } from "@/app/providers/useAuth";
import { useAuditLogs } from "@/features/auditLogs/queries";
import type { AuditLog } from "@/types/models";

const actionStyles: Record<string, string> = {
  CREATE: "bg-success/10 text-success",
  UPDATE: "bg-accent/15 text-accent",
  DELETE: "bg-destructive/10 text-destructive",
  STATUS_CHANGE: "bg-soft/30 text-soft-foreground",
  MAINTENANCE: "bg-warning/10 text-warning",
};

const columns: Column<AuditLog>[] = [
  {
    key: "occurred_at",
    header: "FECHA",
    sortable: true,
    render: (l) => (
      <span className="text-xs text-muted-foreground tabular-nums">
        {new Date(l.occurred_at).toLocaleString("es-ES", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
  {
    key: "actor_type",
    header: "ACTOR",
    render: (l) => (
      <span className="text-xs">
        {l.actor_type === "SYSTEM" ? (
          <span className="text-muted-foreground italic">Sistema</span>
        ) : (
          l.actor_user_id || "—"
        )}
      </span>
    ),
  },
  {
    key: "action",
    header: "ACCIÓN",
    render: (l) => (
      <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${actionStyles[l.action] || "bg-muted text-muted-foreground"}`}
      >
        {l.action}
      </span>
    ),
  },
  {
    key: "entity_type",
    header: "ENTIDAD",
    render: (l) => <span className="text-sm">{l.entity_type}</span>,
  },
  {
    key: "entity_id",
    header: "ID",
    render: (l) => <span className="font-mono text-xs text-muted-foreground">{l.entity_id}</span>,
  },
];

export default function AuditLogsPage() {
  const { clinicId } = useAuth();
  const {
    data: records = [],
    isLoading: logsLoading,
    isFetching: logsFetching,
    isError,
    refetch,
  } = useAuditLogs(clinicId);
  const isLoading = logsLoading || logsFetching;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Registro de auditoría</h2>
        <p className="page-description">Historial de acciones en el sistema</p>
      </div>

      <DataTable
        data={records}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="action"
        searchPlaceholder="Buscar por acción..."
        emptyTitle="Sin registros"
        emptyDescription="No hay registros de auditoría."
      />
    </div>
  );
}
