import { useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import { OpenOrder } from "@/types/models";

const sampleOrders: OpenOrder[] = [
  { id: "1", clinic_id: "c1", requested_by_user_id: "u1", locker_id: "1", compartment_id: "1", product_id: "1", quantity: 5, status: "PENDING", requested_at: "2026-02-28T10:30:00Z", external_ref: "ORD-001" },
  { id: "2", clinic_id: "c1", requested_by_user_id: "u1", locker_id: "3", compartment_id: "5", product_id: "2", quantity: 10, status: "RETIRED", requested_at: "2026-02-28T09:15:00Z", read_at: "2026-02-28T09:20:00Z", external_ref: "ORD-002" },
  { id: "3", clinic_id: "c1", requested_by_user_id: "u2", locker_id: "1", compartment_id: "2", product_id: "3", quantity: 20, status: "PENDING", requested_at: "2026-02-28T08:45:00Z", external_ref: "ORD-003" },
  { id: "4", clinic_id: "c1", requested_by_user_id: "u1", locker_id: "4", compartment_id: "8", product_id: "4", quantity: 2, status: "CANCELLED", requested_at: "2026-02-27T16:00:00Z", external_ref: "ORD-004" },
  { id: "5", clinic_id: "c1", requested_by_user_id: "u3", locker_id: "2", compartment_id: "3", product_id: "1", quantity: 15, status: "RETIRED", requested_at: "2026-02-27T14:30:00Z", read_at: "2026-02-27T14:35:00Z", external_ref: "ORD-005" },
  { id: "6", clinic_id: "c1", requested_by_user_id: "u2", locker_id: "1", compartment_id: "1", product_id: "6", quantity: 3, status: "PENDING", requested_at: "2026-02-28T11:00:00Z", external_ref: "ORD-006" },
];

const columns: Column<OpenOrder>[] = [
  { key: "external_ref", header: "Referencia", sortable: true, render: (o) => <span className="font-mono text-xs font-medium">{o.external_ref}</span> },
  { key: "quantity", header: "Cantidad", render: (o) => <span className="tabular-nums">{o.quantity}</span> },
  { key: "status", header: "Estado", render: (o) => <StatusBadge status={o.status} type="order" /> },
  {
    key: "requested_at",
    header: "Solicitado",
    sortable: true,
    render: (o) => (
      <span className="text-xs text-muted-foreground">
        {new Date(o.requested_at).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
      </span>
    ),
  },
];

export default function OpenOrdersPage() {
  const navigate = useNavigate();
  const { can } = useAuth();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Órdenes de apertura</h2>
        <p className="page-description">Solicitudes de apertura de compartimientos</p>
      </div>

      <DataTable
        data={sampleOrders}
        columns={columns}
        searchKey="external_ref"
        searchPlaceholder="Buscar por referencia..."
        emptyTitle="Sin órdenes"
        emptyDescription="No hay órdenes de apertura registradas."
        headerAction={
          can("RESPONSABLE") ? (
            <Button size="sm" className="h-9 gap-1.5" onClick={() => navigate("/open-orders/new")}>
              <Plus className="h-4 w-4" />
              Nueva orden
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
