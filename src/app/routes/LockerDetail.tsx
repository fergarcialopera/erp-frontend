import { useParams, useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useCompartments } from "@/features/compartments/queries";
import { ArrowLeft } from "lucide-react";
import type { Compartment } from "@/types/models";

const columns: Column<Compartment>[] = [
  {
    key: "code",
    header: "Código",
    render: (c) => <span className="font-mono text-xs font-medium">{c.code}</span>,
  },
  {
    key: "status",
    header: "Estado",
    render: (c) => <StatusBadge status={c.status} type="compartment" />,
  },
  {
    key: "is_active",
    header: "Activo",
    render: (c) => <StatusBadge status={c.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

export default function LockerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: compartments = [], isLoading, isError, refetch } = useCompartments(id ?? null);

  const availableCount = compartments.filter((c) => c.status === "AVAILABLE" && c.is_active).length;
  const maintenanceCount = compartments.filter((c) => c.status === "MAINTENANCE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Volver a lockers"
          onClick={() => navigate("/lockers")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="page-header mb-0">
          <h2 className="page-title">Locker {id ?? "—"}</h2>
          <p className="page-description">Compartimientos asignados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
          <div className="text-2xl font-bold mt-1">{compartments.length}</div>
        </div>
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Disponibles
          </span>
          <div className="text-2xl font-bold mt-1 text-success">{availableCount}</div>
        </div>
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Mantenimiento
          </span>
          <div className="text-2xl font-bold mt-1 text-warning">{maintenanceCount}</div>
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
        emptyTitle="Sin compartimientos"
        emptyDescription="No hay compartimientos en este locker."
      />
    </div>
  );
}
