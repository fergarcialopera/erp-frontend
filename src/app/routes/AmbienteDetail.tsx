import { useParams, useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAmbiente } from "@/features/ambientes/queries";
import { ArrowLeft } from "lucide-react";
import type { Zona } from "@/types/models";
import { tableCell } from "@/components/tableTypography";

const columns: Column<Zona>[] = [
  {
    key: "code",
    header: "CÓDIGO",
    render: (z) => <span className={`${tableCell.mono} font-medium`}>{z.code}</span>,
  },
  {
    key: "is_active",
    header: "ACTIVO",
    render: (z) => <StatusBadge status={z.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

export default function AmbienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: ambiente,
    isLoading: ambienteLoading,
    isFetching: ambienteFetching,
    isError,
    refetch,
  } = useAmbiente(id ?? null);
  const zones = ambiente?.zones ?? [];
  const isLoading = ambienteLoading || ambienteFetching;

  const activeCount = zones.filter((z) => z.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Volver a ambientes"
          onClick={() => navigate("/ambientes")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="page-header mb-0">
          <h2 className="page-title">{ambiente?.name ?? id ?? "—"}</h2>
          <p className="page-description">
            {ambiente?.location
              ? `${ambiente.location}${ambiente.device_id ? ` · ${ambiente.device_id}` : ""}`
              : "Zonas asignadas"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
          <div className="text-2xl font-bold mt-1">{zones.length}</div>
        </div>
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Activas</span>
          <div className="text-2xl font-bold mt-1 text-success">{activeCount}</div>
        </div>
      </div>

      <DataTable
        data={zones}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="code"
        searchPlaceholder="Buscar zona..."
        emptyTitle="Sin zonas"
        emptyDescription="No hay zonas en este ambiente."
      />
    </div>
  );
}
