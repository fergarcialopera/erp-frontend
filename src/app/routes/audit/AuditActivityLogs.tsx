import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TABLE_CHIP_CLASS, tableCell } from "@/components/tableTypography";
import {
  ListFilterField,
  ListFiltersToolbar,
  type ListFilterChip,
} from "@/components/ListFiltersToolbar";
import { useClinics } from "@/features/clinics/queries";
import { useActivityAuditLogDetail, useActivityAuditLogs } from "@/features/auditLogs/queries";
import { AuditTablePagination } from "@/features/auditLogs/components/AuditTablePagination";
import {
  activityTypeLabel,
  activityTypeStyle,
  auditUserLabel,
  formatAuditDate,
} from "@/features/auditLogs/labels";
import type { ActivityAuditLog } from "@/types/audit";
import { auditBasePath, type AuditScopeProps } from "./auditPaths";

const ALL = "__all__";

const TYPE_OPTIONS = [
  { value: ALL, label: "Todos los tipos" },
  { value: "add", label: "Alta" },
  { value: "edit", label: "Edición" },
  { value: "delete", label: "Baja" },
] as const;

const columns = (showClinic: boolean): Column<ActivityAuditLog>[] => [
  {
    key: "type",
    header: "ACCIÓN",
    sortable: true,
    render: (log) => (
      <span className={`${TABLE_CHIP_CLASS} ${activityTypeStyle(log.type)}`}>
        {activityTypeLabel(log.type)}
      </span>
    ),
  },
  {
    key: "entity",
    header: "ENTIDAD",
    sortable: true,
    render: (log) => <span className={tableCell.primary}>{log.entity || "—"}</span>,
  },
  {
    key: "entity_id",
    header: "ID ENTIDAD",
    hideBelowSm: true,
    render: (log) => <span className={tableCell.mono}>{log.entity_id || "—"}</span>,
  },
  {
    key: "user",
    header: "USUARIO",
    sortable: true,
    render: (log) => <span className={tableCell.primary}>{auditUserLabel(log.user)}</span>,
  },
  ...(showClinic
    ? [
        {
          key: "clinic",
          header: "CLÍNICA",
          sortable: true,
          hideBelowSm: true,
          render: (log: ActivityAuditLog) => (
            <span className={tableCell.primary}>{log.clinic?.name ?? "—"}</span>
          ),
        } satisfies Column<ActivityAuditLog>,
      ]
    : []),
  {
    key: "registered_at",
    header: "FECHA",
    sortable: true,
    render: (log) => (
      <span className={`${tableCell.muted} tabular-nums`}>
        {formatAuditDate(log.registered_at)}
      </span>
    ),
  },
];

function formatPayload(data: Record<string, unknown> | undefined): string {
  if (!data) return "Sin datos adicionales.";
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

export default function AuditActivityLogs({ platformScope = false }: AuditScopeProps) {
  const base = auditBasePath(platformScope);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [clinicFilter, setClinicFilter] = useState<string>(ALL);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: clinics = [] } = useClinics(platformScope);

  const queryParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      ...(platformScope && clinicFilter !== ALL ? { clinic_id: clinicFilter } : {}),
      ...(typeFilter !== ALL ? { type: typeFilter } : {}),
    }),
    [page, perPage, platformScope, clinicFilter, typeFilter],
  );

  const { data, isLoading, isFetching, isError, refetch } = useActivityAuditLogs(queryParams);
  const isRefreshing = isFetching && !isLoading;
  const { data: detail, isLoading: detailLoading } = useActivityAuditLogDetail(selectedId);

  const records = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, per_page: perPage, total: 0 };
  const tableColumns = useMemo(() => columns(platformScope), [platformScope]);

  const advancedActiveCount = platformScope && clinicFilter !== ALL ? 1 : 0;

  const filterChips: ListFilterChip[] = useMemo(() => {
    const chips: ListFilterChip[] = [];
    if (typeFilter !== ALL) {
      const label = TYPE_OPTIONS.find((o) => o.value === typeFilter)?.label ?? typeFilter;
      chips.push({
        id: "type",
        label: `Acción: ${label}`,
        onRemove: () => {
          setTypeFilter(ALL);
          setPage(1);
        },
      });
    }
    if (platformScope && clinicFilter !== ALL) {
      const name = clinics.find((c) => c.id === clinicFilter)?.name ?? "Clínica";
      chips.push({
        id: "clinic",
        label: `Clínica: ${name}`,
        onRemove: () => {
          setClinicFilter(ALL);
          setPage(1);
        },
      });
    }
    return chips;
  }, [typeFilter, clinicFilter, platformScope, clinics]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link to={base}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a auditoría
          </Link>
        </Button>
        <h2 className="page-title">Auditoría de actividad</h2>
        <p className="page-description">
          Registro de altas, ediciones y bajas en entidades del sistema.
        </p>
      </div>

      <DataTable
        data={records}
        columns={tableColumns}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isError={isError}
        onRetry={() => refetch()}
        onRowClick={(log) => setSelectedId(log.id)}
        searchKey="entity"
        searchPlaceholder="Buscar por entidad..."
        emptyTitle="Sin registros de actividad"
        emptyDescription="No hay cambios registrados que coincidan con los filtros."
        hidePagination
        pageSize={perPage}
        footer={
          <AuditTablePagination
            meta={meta}
            pageSize={perPage}
            isRefreshing={isRefreshing}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPerPage(size);
              setPage(1);
            }}
          />
        }
        filters={
          <ListFiltersToolbar
            primaryFilters={
              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[160px]">
                  <SelectValue placeholder="Tipo de acción" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
            advancedActiveCount={advancedActiveCount}
            chips={filterChips}
            onClearAll={() => {
              setTypeFilter(ALL);
              setClinicFilter(ALL);
              setPage(1);
            }}
            advancedFilters={
              platformScope ? (
                <ListFilterField label="Clínica">
                  <Select
                    value={clinicFilter}
                    onValueChange={(v) => {
                      setClinicFilter(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue placeholder="Clínica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL}>Todas las clínicas</SelectItem>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ListFilterField>
              ) : undefined
            }
          />
        }
      />

      <Dialog open={selectedId != null} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de actividad</DialogTitle>
          </DialogHeader>
          {detailLoading || !detail ? (
            <p className="text-sm text-muted-foreground">Cargando detalle…</p>
          ) : (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                <dt className="text-muted-foreground">Acción</dt>
                <dd>{activityTypeLabel(detail.type)}</dd>
                <dt className="text-muted-foreground">Entidad</dt>
                <dd>{detail.entity}</dd>
                <dt className="text-muted-foreground">ID</dt>
                <dd className="font-mono text-xs break-all">{detail.entity_id}</dd>
                <dt className="text-muted-foreground">Usuario</dt>
                <dd>{auditUserLabel(detail.user)}</dd>
                <dt className="text-muted-foreground">Fecha</dt>
                <dd>{formatAuditDate(detail.registered_at)}</dd>
              </dl>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Datos del cambio</p>
                <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                  {formatPayload(detail.data)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
