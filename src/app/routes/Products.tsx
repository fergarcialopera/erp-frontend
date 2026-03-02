import { useState } from "react";
import { useProducts } from "@/features/products/queries";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/useAuth";
import { Plus } from "lucide-react";
import { Product } from "@/types/models";

const columns: Column<Product>[] = [
  {
    key: "sku",
    header: "SKU",
    sortable: true,
    render: (p) => <span className="font-mono text-xs">{p.sku}</span>,
  },
  { key: "name", header: "Nombre", sortable: true },
  {
    key: "barcode",
    header: "Código barras",
    render: (p) => (
      <span className="font-mono text-xs text-muted-foreground">{p.barcode || "—"}</span>
    ),
  },
  {
    key: "is_active",
    header: "Estado",
    render: (p) => <StatusBadge status={p.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

export default function ProductsPage() {
  const { clinicId, can } = useAuth();
  const { data: records, isLoading, isError, refetch } = useProducts(clinicId);
  const canEdit = can("RESPONSABLE");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <p className="page-description">Catálogo de productos registrados en el sistema</p>
      </div>

      <DataTable
        data={records || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar producto..."
        emptyTitle="Sin productos"
        emptyDescription="No hay productos registrados aún."
        headerAction={
          canEdit ? (
            <Button size="sm" className="h-9 gap-1.5">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}
