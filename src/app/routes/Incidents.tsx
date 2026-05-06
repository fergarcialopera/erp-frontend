import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/DataTable";
import { useAuth } from "@/app/providers/useAuth";
import { useIncidents } from "@/features/incidents/queries";
import type { Incident } from "@/types/models";

function sourceLabel(incident: Incident): string {
  const source = String(incident.source ?? "").toUpperCase();
  if (source === "LOCKER") return "Locker físico";
  if (source === "ERP") return "Sistema ERP";
  return source || "—";
}

function statusLabel(incident: Incident): string {
  return incident.status?.trim() || "Abierta";
}

function dateLabel(incident: Incident): string {
  if (!incident.created_at) return "—";
  return new Date(incident.created_at).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type IncidentRow = Incident;

const columns: Column<IncidentRow>[] = [
  {
    key: "title",
    header: "INCIDENCIA",
    sortable: true,
    render: (incident) => (
      <div className="space-y-1">
        <p className="text-sm font-medium">{incident.title?.trim() || "Incidencia sin título"}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{incident.description || "—"}</p>
      </div>
    ),
  },
  {
    key: "source",
    header: "ORIGEN",
    sortable: true,
    render: (incident) => <span className="text-sm">{sourceLabel(incident)}</span>,
  },
  {
    key: "status",
    header: "ESTADO",
    sortable: true,
    render: (incident) => <span className="text-sm">{statusLabel(incident)}</span>,
  },
  {
    key: "reported_by_user_name",
    header: "REPORTADO POR",
    sortable: true,
    render: (incident) => <span className="text-sm">{incident.reported_by_user_name ?? "—"}</span>,
  },
  {
    key: "created_at",
    header: "CREADA",
    sortable: true,
    render: (incident) => <span className="text-xs text-muted-foreground">{dateLabel(incident)}</span>,
  },
];

export default function IncidentsPage() {
  const navigate = useNavigate();
  const { clinicId } = useAuth();
  const {
    data: incidents = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useIncidents(clinicId);

  const records: IncidentRow[] = useMemo(
    () =>
      [...incidents].sort(
        (a, b) => new Date(b.created_at ?? "").getTime() - new Date(a.created_at ?? "").getTime(),
      ),
    [incidents],
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Incidencias</h2>
        <p className="page-description">
          Registro de incidencias reportadas por técnicos en ERP y lockers físicos
        </p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="description"
        searchPlaceholder="Buscar por descripción..."
        emptyTitle="Sin incidencias"
        emptyDescription="Todavía no hay incidencias registradas."
        headerAction={
          <Button
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => navigate("/incidents/new")}
            aria-label="Registrar nueva incidencia"
          >
            <Plus className="h-4 w-4" />
            Nueva incidencia
          </Button>
        }
        emptyAction={
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => navigate("/incidents/new")}
          >
            <AlertTriangle className="h-4 w-4" />
            Reportar incidencia
          </Button>
        }
      />
    </div>
  );
}
