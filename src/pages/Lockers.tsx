import { useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import { Locker } from "@/types/models";

const sampleLockers: Locker[] = [
  { id: "1", clinic_id: "c1", code: "LOC-A1", name: "Locker Zona A - 1", location: "Planta Baja, Pasillo A", is_active: true },
  { id: "2", clinic_id: "c1", code: "LOC-A2", name: "Locker Zona A - 2", location: "Planta Baja, Pasillo A", is_active: true },
  { id: "3", clinic_id: "c1", code: "LOC-B3", name: "Locker Zona B - 3", location: "Primer Piso, Sala B", is_active: true },
  { id: "4", clinic_id: "c1", code: "LOC-C1", name: "Locker Zona C - 1", location: "Segundo Piso", is_active: true },
  { id: "5", clinic_id: "c1", code: "LOC-D1", name: "Locker Emergencia", location: "Urgencias", is_active: false },
];

const columns: Column<Locker>[] = [
  { key: "code", header: "Código", sortable: true, render: (l) => <span className="font-mono text-xs font-medium">{l.code}</span> },
  { key: "name", header: "Nombre", sortable: true },
  { key: "location", header: "Ubicación", render: (l) => <span className="text-muted-foreground">{l.location || "—"}</span> },
  { key: "is_active", header: "Estado", render: (l) => <StatusBadge status={l.is_active ? "Activo" : "Inactivo"} type="active" /> },
];

export default function LockersPage() {
  const navigate = useNavigate();
  const { can } = useAuth();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Lockers</h2>
        <p className="page-description">Gestión de lockers y compartimientos</p>
      </div>

      <DataTable
        data={sampleLockers}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar locker..."
        onRowClick={(locker) => navigate(`/lockers/${locker.id}`)}
        emptyTitle="Sin lockers"
        emptyDescription="No hay lockers registrados."
        headerAction={
          can("ADMIN") ? (
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
