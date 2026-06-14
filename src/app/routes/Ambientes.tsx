import { useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/app/providers/useAuth";
import { useAmbientes } from "@/features/ambientes/queries";
import { Plus } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import type { Ambiente } from "@/types/models";

const columns: Column<Ambiente>[] = [
  {
    key: "name",
    header: "NOMBRE",
    sortable: true,
    render: (a) => <span className={tableCell.primary}>{a.name}</span>,
  },
  {
    key: "location",
    header: "UBICACIÓN",
    hideBelowSm: true,
    render: (a) => <span className={tableCell.muted}>{a.location || "—"}</span>,
  },
  {
    key: "device_id",
    header: "DISPOSITIVO",
    hideBelowSm: true,
    render: (a) => (
      <span className={`${tableCell.mono} text-muted-foreground`}>{a.device_id || "—"}</span>
    ),
  },
  {
    key: "is_active",
    header: "ESTADO",
    render: (a) => <StatusBadge status={a.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

export default function AmbientesPage() {
  const { clinicId, canAccessManagement } = useAuth();
  const {
    data: records,
    isLoading: ambientesLoading,
    isFetching: ambientesFetching,
    isError,
    refetch,
  } = useAmbientes(clinicId);
  const isLoading = ambientesLoading || ambientesFetching;
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Ambientes</h2>
        <p className="page-description">Gestión de ambientes y zonas</p>
      </div>

      <DataTable
        data={records || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar ambiente..."
        onRowClick={(ambiente) => navigate(`/ambientes/${ambiente.id}`)}
        emptyTitle="Sin ambientes"
        emptyDescription="No hay ambientes registrados."
        headerAction={
          canAccessManagement() ? (
            <TableHeaderButton label="Nuevo ambiente" icon={<Plus />} aria-label="Nuevo ambiente" />
          ) : undefined
        }
      />
    </div>
  );
}
