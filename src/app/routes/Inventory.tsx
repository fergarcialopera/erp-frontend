import { useMemo } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/useAuth";
import { useInventory } from "@/features/inventory/queries";
import { useNavigate } from "react-router-dom";
import { ClipboardList, PackagePlus, Plus } from "lucide-react";
import type { CompartmentInventory } from "@/types/models";

function rowLockerDisplay(r: CompartmentInventory): string {
  return r.locker?.code ?? r.locker_code ?? r.locker_id ?? "—";
}
function rowCompartmentDisplay(r: CompartmentInventory): string {
  return r.compartment?.code ?? r.compartment_name ?? r.compartment_code ?? r.compartment_id ?? "—";
}
function rowProductSku(r: CompartmentInventory): string {
  return r.product?.sku ?? r.product_sku ?? r.product_id ?? "—";
}
function rowProductName(r: CompartmentInventory): string {
  return r.product?.name ?? r.product_name ?? r.product_id ?? "—";
}

type InventoryRow = CompartmentInventory;

const columns: Column<InventoryRow>[] = [
  {
    key: "locker_code",
    header: "LOCKER",
    sortable: true,
    render: (r) => <span className="text-sm font-mono">{rowLockerDisplay(r)}</span>,
  },
  {
    key: "compartment_name",
    header: "COMPARTIMENTO",
    sortable: true,
    render: (r) => <span className="text-sm">{rowCompartmentDisplay(r)}</span>,
  },
  {
    key: "product_sku",
    header: "SKU",
    sortable: true,
    render: (r) => <span className="font-mono text-xs text-muted-foreground">{rowProductSku(r)}</span>,
  },
  {
    key: "product_name",
    header: "PRODUCTO",
    sortable: true,
    render: (r) => <span className="text-sm">{rowProductName(r)}</span>,
  },
  {
    key: "qty_available",
    header: "DISPONIBLE",
    sortable: true,
    render: (r) => <span className="text-sm font-medium tabular-nums">{r.qty_available}</span>,
  },
  {
    key: "qty_reserved",
    header: "RESERVADO",
    sortable: true,
    render: (r) => <span className="text-sm tabular-nums">{r.qty_reserved}</span>,
  },
];

export default function InventoryPage() {
  const navigate = useNavigate();
  const { clinicId } = useAuth();
  const {
    data: inventory = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useInventory(clinicId);

  const records: InventoryRow[] = useMemo(
    () =>
      inventory.map((r) => ({
        ...r,
        product_name: rowProductName(r),
        product_sku: rowProductSku(r),
        locker_code: rowLockerDisplay(r),
        compartment_name: rowCompartmentDisplay(r),
      })),
    [inventory],
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Inventario</h2>
        <p className="page-description">Vista de solo lectura del inventario por compartimiento</p>
      </div>

      <DataTable
        data={records}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="product_name"
        searchPlaceholder="Buscar por producto..."
        emptyTitle="Sin inventario"
        emptyDescription="No hay registros de inventario."
        headerAction={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => navigate("/exit-logs")}
              aria-label="Ver salidas de stock"
            >
              <ClipboardList className="h-4 w-4" />
              Ver salidas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => navigate("/exit-logs/new")}
              aria-label="Registrar salida de stock"
            >
              <PackagePlus className="h-4 w-4" />
              Registrar salida
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => navigate("/entry-logs/new")}
              aria-label="Registrar entrada de stock"
            >
              <Plus className="h-4 w-4" />
              Registrar entrada
            </Button>
          </div>
        }
      />
    </div>
  );
}
