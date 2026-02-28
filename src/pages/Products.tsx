import { useState } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import { Product } from "@/types/models";

// Sample data — will be replaced by API
const sampleProducts: Product[] = [
  { id: "1", clinic_id: "c1", sku: "SKU-001", name: "Guantes estériles L", barcode: "7501234567890", is_active: true },
  { id: "2", clinic_id: "c1", sku: "SKU-002", name: "Jeringa 10ml", barcode: "7501234567891", is_active: true },
  { id: "3", clinic_id: "c1", sku: "SKU-003", name: "Mascarilla N95", barcode: "7501234567892", is_active: true },
  { id: "4", clinic_id: "c1", sku: "SKU-004", name: "Alcohol gel 500ml", is_active: true },
  { id: "5", clinic_id: "c1", sku: "SKU-005", name: "Vendaje elástico 10cm", is_active: false },
  { id: "6", clinic_id: "c1", sku: "SKU-006", name: "Suero fisiológico 1L", barcode: "7501234567895", is_active: true },
  { id: "7", clinic_id: "c1", sku: "SKU-007", name: "Bisturí desechable #15", is_active: true },
  { id: "8", clinic_id: "c1", sku: "SKU-008", name: "Catéter IV 18G", barcode: "7501234567897", is_active: true },
];

const columns: Column<Product>[] = [
  { key: "sku", header: "SKU", sortable: true, render: (p) => <span className="font-mono text-xs">{p.sku}</span> },
  { key: "name", header: "Nombre", sortable: true },
  { key: "barcode", header: "Código barras", render: (p) => <span className="font-mono text-xs text-muted-foreground">{p.barcode || "—"}</span> },
  {
    key: "is_active",
    header: "Estado",
    render: (p) => <StatusBadge status={p.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

export default function ProductsPage() {
  const { can } = useAuth();
  const canEdit = can("RESPONSABLE");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <p className="page-description">Catálogo de productos registrados en el sistema</p>
      </div>

      <DataTable
        data={sampleProducts}
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
