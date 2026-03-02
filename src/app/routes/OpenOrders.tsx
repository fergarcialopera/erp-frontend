import { useNavigate } from "react-router-dom";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/useAuth";
import { useOpenOrders } from "@/features/openOrders/queries";
import { Plus } from "lucide-react";
import type { OpenOrder } from "@/types/models";

const columns: Column<OpenOrder>[] = [
  {
    key: "external_ref",
    header: "Referencia",
    sortable: true,
    render: (o) => <span className="font-mono text-xs font-medium">{o.external_ref}</span>,
  },
  {
    key: "quantity",
    header: "Cantidad",
    render: (o) => <span className="tabular-nums">{o.quantity}</span>,
  },
  {
    key: "status",
    header: "Estado",
    render: (o) => <StatusBadge status={o.status} type="order" />,
  },
  {
    key: "requested_at",
    header: "Solicitado",
    sortable: true,
    render: (o) => (
      <span className="text-xs text-muted-foreground">
        {new Date(o.requested_at).toLocaleString("es-ES", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
];

export default function OpenOrdersPage() {
  const { clinicId, can } = useAuth();
  const { data: records, isLoading, isError, refetch } = useOpenOrders(clinicId);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Órdenes de apertura</h2>
        <p className="page-description">Solicitudes de apertura de compartimientos</p>
      </div>

      <DataTable
        data={records || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="external_ref"
        searchPlaceholder="Buscar por referencia..."
        emptyTitle="Sin órdenes"
        emptyDescription="No hay órdenes de apertura registradas."
        emptyAction={
          can("RESPONSABLE") ? (
            <Button size="sm" className="h-9 gap-1.5" onClick={() => navigate("/open-orders/new")}>
              <Plus className="h-4 w-4" />
              Crear primera orden
            </Button>
          ) : undefined
        }
        headerAction={
          can("RESPONSABLE") ? (
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => navigate("/open-orders/new")}
              aria-label="Nueva orden de apertura"
            >
              <Plus className="h-4 w-4" />
              Nueva orden
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
