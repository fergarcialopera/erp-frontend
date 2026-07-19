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
import { TABLE_CHIP_CLASS, tableCell } from "@/components/tableTypography";
import {
  ListFilterField,
  ListFiltersToolbar,
  type ListFilterChip,
} from "@/components/ListFiltersToolbar";
import { useClinics } from "@/features/clinics/queries";
import { useAccessAuditLogs } from "@/features/auditLogs/queries";
import { AuditTablePagination } from "@/features/auditLogs/components/AuditTablePagination";
import {
  accessEventLabel,
  auditUserLabel,
  formatAuditDate,
  successLabel,
  successStyle,
} from "@/features/auditLogs/labels";
import type { AccessAuditLog } from "@/types/audit";
import { auditBasePath, type AuditScopeProps } from "./auditPaths";

const ALL = "__all__";

const columns = (showClinic: boolean): Column<AccessAuditLog>[] => [
  {
    key: "event",
    header: "EVENTO",
    sortable: true,
    render: (log) => (
      <span className={`${TABLE_CHIP_CLASS} bg-muted text-muted-foreground`}>
        {accessEventLabel(log.event)}
      </span>
    ),
  },
  {
    key: "success",
    header: "RESULTADO",
    sortable: true,
    render: (log) => (
      <span className={`${TABLE_CHIP_CLASS} ${successStyle(log.success)}`}>
        {successLabel(log.success)}
      </span>
    ),
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
          render: (log: AccessAuditLog) => (
            <span className={tableCell.primary}>{log.clinic?.name ?? "—"}</span>
          ),
        } satisfies Column<AccessAuditLog>,
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
  {
    key: "ip_address",
    header: "IP",
    hideBelowMd: true,
    render: (log) => <span className={tableCell.mono}>{log.ip_address || "—"}</span>,
  },
  {
    key: "error",
    header: "ERROR",
    hideBelowMd: true,
    render: (log) => (
      <span className={`${tableCell.muted} line-clamp-2`}>{log.error?.trim() || "—"}</span>
    ),
  },
];

export default function AuditAccessLogs({ platformScope = false }: AuditScopeProps) {
  const base = auditBasePath(platformScope);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [successFilter, setSuccessFilter] = useState<string>(ALL);
  const [clinicFilter, setClinicFilter] = useState<string>(ALL);

  const { data: clinics = [] } = useClinics(platformScope);

  const queryParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      ...(platformScope && clinicFilter !== ALL ? { clinic_id: clinicFilter } : {}),
      ...(successFilter === "true" ? { success: true } : {}),
      ...(successFilter === "false" ? { success: false } : {}),
    }),
    [page, perPage, platformScope, clinicFilter, successFilter],
  );

  const { data, isLoading, isFetching, isError, refetch } = useAccessAuditLogs(queryParams);
  const isRefreshing = isFetching && !isLoading;

  const records = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, per_page: perPage, total: 0 };
  const tableColumns = useMemo(() => columns(platformScope), [platformScope]);

  const advancedActiveCount = platformScope && clinicFilter !== ALL ? 1 : 0;

  const filterChips: ListFilterChip[] = useMemo(() => {
    const chips: ListFilterChip[] = [];
    if (successFilter !== ALL) {
      chips.push({
        id: "success",
        label: successFilter === "true" ? "Resultado: Correctos" : "Resultado: Fallidos",
        onRemove: () => {
          setSuccessFilter(ALL);
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
  }, [successFilter, clinicFilter, platformScope, clinics]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
          <Link to={base}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a auditoría
          </Link>
        </Button>
        <h2 className="page-title">Auditoría de accesos</h2>
        <p className="page-description">
          Registro de inicios de sesión y eventos de autenticación.
        </p>
      </div>

      <DataTable
        data={records}
        columns={tableColumns}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="event"
        searchPlaceholder="Buscar por evento..."
        emptyTitle="Sin registros de acceso"
        emptyDescription="No hay eventos de autenticación que coincidan con los filtros."
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
                value={successFilter}
                onValueChange={(v) => {
                  setSuccessFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos los resultados</SelectItem>
                  <SelectItem value="true">Solo correctos</SelectItem>
                  <SelectItem value="false">Solo fallidos</SelectItem>
                </SelectContent>
              </Select>
            }
            advancedActiveCount={advancedActiveCount}
            chips={filterChips}
            onClearAll={() => {
              setSuccessFilter(ALL);
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
    </div>
  );
}
