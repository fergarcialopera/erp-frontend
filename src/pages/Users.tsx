import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { User } from "@/types/models";

const sampleUsers: User[] = [
  { id: "1", clinic_id: "c1", name: "Ana García", email: "ana@clinic.com", role: "ADMIN", is_active: true },
  { id: "2", clinic_id: "c1", name: "Carlos López", email: "carlos@clinic.com", role: "RESPONSABLE", is_active: true },
  { id: "3", clinic_id: "c1", name: "María Torres", email: "maria@clinic.com", role: "RESPONSABLE", is_active: true },
  { id: "4", clinic_id: "c1", name: "Pedro Ruiz", email: "pedro@clinic.com", role: "READONLY", is_active: true },
  { id: "5", clinic_id: "c1", name: "Laura Sánchez", email: "laura@clinic.com", role: "READONLY", is_active: false },
];

const roleStyles: Record<string, string> = {
  ADMIN: "bg-accent/15 text-accent border-accent/25",
  RESPONSABLE: "bg-soft/30 text-soft-foreground border-soft/40",
  READONLY: "bg-muted text-muted-foreground border-border",
};

const columns: Column<User>[] = [
  { key: "name", header: "Nombre", sortable: true },
  { key: "email", header: "Email", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
  {
    key: "role",
    header: "Rol",
    render: (u) => (
      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border ${roleStyles[u.role]}`}>
        {u.role}
      </span>
    ),
  },
  { key: "is_active", header: "Estado", render: (u) => <StatusBadge status={u.is_active ? "Activo" : "Inactivo"} type="active" /> },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Usuarios</h2>
        <p className="page-description">Gestión de usuarios del sistema</p>
      </div>

      <DataTable
        data={sampleUsers}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar usuario..."
        emptyTitle="Sin usuarios"
        emptyDescription="No hay usuarios registrados."
        headerAction={
          <Button size="sm" className="h-9 gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />
    </div>
  );
}
