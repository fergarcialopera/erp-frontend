import { useParams, useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAmbiente } from "@/features/ambientes/queries";
import { ArrowLeft } from "lucide-react";
import type { Compartment } from "@/types/models";
import { tableCell } from "@/components/tableTypography";

const columns: Column<Compartment>[] = [
  {
    key: "code",
    header: "CÓDIGO",
    render: (c) => <span className={`${tableCell.mono} font-medium`}>{c.code}</span>,
  },
  {
    key: "is_active",
    header: "ACTIVO",
    render: (c) => <StatusBadge status={c.is_active ? "Activo" : "Inactivo"} type="active" />,
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
  const compartments = ambiente?.compartments ?? [];
  const isLoading = ambienteLoading || ambienteFetching;

  const activeCount = compartments.filter((c) => c.is_active).length;

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
              : "Compartimientos asignados"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
          <div className="text-2xl font-bold mt-1">{compartments.length}</div>
        </div>
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Activos</span>
          <div className="text-2xl font-bold mt-1 text-success">{activeCount}</div>
        </div>
      </div>

      <DataTable
        data={compartments}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="code"
        searchPlaceholder="Buscar compartimiento..."
        emptyTitle="Sin compartimentos"
        emptyDescription="No hay compartimentos en este ambiente."
      />
    </div>
  );
}
