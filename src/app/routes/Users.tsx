import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/AuthContext";
import { useUsers } from "@/features/users/queries";
import { Plus } from "lucide-react";
import { User } from "@/types/models";

const roleStyles: Record<string, string> = {
  ADMIN: "bg-accent/15 text-accent border-accent/25",
  RESPONSABLE: "bg-soft/30 text-soft-foreground border-soft/40",
  READONLY: "bg-muted text-muted-foreground border-border",
};

const columns: Column<User>[] = [
  { key: "name", header: "Nombre", sortable: true },
  {
    key: "email",
    header: "Email",
    render: (u) => <span className="text-muted-foreground">{u.email}</span>,
  },
  {
    key: "role",
    header: "Rol",
    render: (u) => (
      <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border ${roleStyles[u.role]}`}
      >
        {u.role}
      </span>
    ),
  },
  {
    key: "is_active",
    header: "Estado",
    render: (u) => <StatusBadge status={u.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

export default function UsersPage() {
  const { clinicId } = useAuth();
  const { data: records, isLoading, isError, refetch } = useUsers(clinicId);
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Usuarios</h2>
        <p className="page-description">Gestión de usuarios del sistema</p>
      </div>

      <DataTable
        data={records || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar usuario..."
        emptyTitle="Sin usuarios"
        emptyDescription="No hay usuarios registrados."
        headerAction={
          <Button size="sm" className="h-9 gap-1.5" aria-label="Nuevo usuario">
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />
    </div>
  );
}
