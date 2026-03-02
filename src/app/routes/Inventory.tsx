import { DataTable, Column } from "@/components/DataTable";
import { useAuth } from "@/app/providers/AuthContext";
import { useInventory } from "@/features/inventory/queries";
import type { CompartmentInventory } from "@/types/models";

const columns: Column<CompartmentInventory>[] = [
  {
    key: "compartment_id",
    header: "ID Compartimiento",
    sortable: true,
    render: (r) => <span className="font-mono text-xs">{r.compartment_id}</span>,
  },
  {
    key: "product_id",
    header: "ID Producto",
    sortable: true,
    render: (r) => <span className="font-mono text-xs">{r.product_id}</span>,
  },
  {
    key: "qty_available",
    header: "Disponible",
    sortable: true,
    render: (r) => <span className="text-sm font-medium tabular-nums">{r.qty_available}</span>,
  },
  {
    key: "qty_reserved",
    header: "Reservado",
    sortable: true,
    render: (r) => (
      <span className="text-sm tabular-nums text-muted-foreground">{r.qty_reserved}</span>
    ),
  },
];

export default function InventoryPage() {
  const { clinicId } = useAuth();
  const { data: records, isLoading, isError, refetch } = useInventory(clinicId);
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Inventario</h2>
        <p className="page-description">Estado actual del inventario por compartimiento</p>
      </div>

      <DataTable
        data={records || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="product_id"
        searchPlaceholder="Buscar por producto..."
        emptyTitle="Sin inventario"
        emptyDescription="No hay registros de inventario."
      />
    </div>
  );
}
