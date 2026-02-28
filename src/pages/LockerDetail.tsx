import { useParams, useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Compartment } from "@/types/models";

const sampleCompartments: Compartment[] = [
  { id: "1", locker_id: "1", code: "A1-01", status: "AVAILABLE", is_active: true },
  { id: "2", locker_id: "1", code: "A1-02", status: "AVAILABLE", is_active: true },
  { id: "3", locker_id: "1", code: "A1-03", status: "MAINTENANCE", is_active: true },
  { id: "4", locker_id: "1", code: "A1-04", status: "AVAILABLE", is_active: true },
  { id: "5", locker_id: "1", code: "A1-05", status: "AVAILABLE", is_active: false },
];

const columns: Column<Compartment>[] = [
  { key: "code", header: "Código", render: (c) => <span className="font-mono text-xs font-medium">{c.code}</span> },
  { key: "status", header: "Estado", render: (c) => <StatusBadge status={c.status} type="compartment" /> },
  { key: "is_active", header: "Activo", render: (c) => <StatusBadge status={c.is_active ? "Activo" : "Inactivo"} type="active" /> },
];

export default function LockerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/lockers")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="page-header mb-0">
          <h2 className="page-title">Locker #{id}</h2>
          <p className="page-description">Compartimientos asignados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
          <div className="text-2xl font-bold mt-1">{sampleCompartments.length}</div>
        </div>
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Disponibles</span>
          <div className="text-2xl font-bold mt-1 text-success">
            {sampleCompartments.filter((c) => c.status === "AVAILABLE" && c.is_active).length}
          </div>
        </div>
        <div className="stat-card">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Mantenimiento</span>
          <div className="text-2xl font-bold mt-1 text-warning">
            {sampleCompartments.filter((c) => c.status === "MAINTENANCE").length}
          </div>
        </div>
      </div>

      <DataTable
        data={sampleCompartments}
        columns={columns}
        searchKey="code"
        searchPlaceholder="Buscar compartimiento..."
      />
    </div>
  );
}
