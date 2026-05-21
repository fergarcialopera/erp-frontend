import { useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/useAuth";
import { useLockers } from "@/features/lockers/queries";
import { Plus } from "lucide-react";
import type { Locker } from "@/types/models";

const columns: Column<Locker>[] = [
  {
    key: "code",
    header: "CÓDIGO",
    sortable: true,
    render: (l) => <span className="font-mono text-xs font-medium">{l.code}</span>,
  },
  { key: "name", header: "NOMBRE", sortable: true },
  {
    key: "location",
    header: "UBICACIÓN",
    render: (l) => <span className="text-muted-foreground">{l.location || "—"}</span>,
  },
  {
    key: "is_active",
    header: "ESTADO",
    render: (l) => <StatusBadge status={l.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

export default function LockersPage() {
  const { clinicId, canAccessManagement } = useAuth();
  const {
    data: records,
    isLoading: lockersLoading,
    isFetching: lockersFetching,
    isError,
    refetch,
  } = useLockers(clinicId);
  const isLoading = lockersLoading || lockersFetching;
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Lockers</h2>
        <p className="page-description">Gestión de lockers y compartimientos</p>
      </div>

      <DataTable
        data={records || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar locker..."
        onRowClick={(locker) => navigate(`/lockers/${locker.id}`)}
        emptyTitle="Sin lockers"
        emptyDescription="No hay lockers registrados."
        headerAction={
          canAccessManagement() ? (
            <Button size="sm" className="h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              Nuevo locker
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
