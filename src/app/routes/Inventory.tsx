import { useMemo, useState } from "react";
import { NewEntryLogDialog } from "@/features/inventory/components/NewEntryLogDialog";
import { EditInventoryDialog } from "@/features/inventory/components/EditInventoryDialog";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/useAuth";
import { useInventory } from "@/features/inventory/queries";
import { useNavigate } from "react-router-dom";
import { ClipboardList, PackagePlus, Pencil, Plus } from "lucide-react";
import type { CompartmentInventory } from "@/types/models";

function rowLockerDisplay(r: CompartmentInventory): string {
  return r.locker?.code ?? r.locker?.name ?? r.locker_code ?? r.locker_name ?? r.locker_id ?? "—";
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

const baseColumns: Column<InventoryRow>[] = [
  {
    key: "product_name",
    header: "PRODUCTO",
    sortable: true,
    render: (r) => <span className="text-sm">{rowProductName(r)}</span>,
  },
  {
    key: "product_sku",
    header: "SKU",
    sortable: true,
    render: (r) => <span className="font-mono text-xs text-muted-foreground">{rowProductSku(r)}</span>,
  },
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
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<InventoryRow | null>(null);
  const { clinicId, canAccessConfig, canAccessManagement } = useAuth();
  const canCorrectInventory = canAccessConfig();
  const canRegisterEntry = canAccessManagement();
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

  const columns: Column<InventoryRow>[] = useMemo(
    () => [
      ...baseColumns,
      ...(canCorrectInventory
        ? [
            {
              key: "actions",
              header: "ACCIONES",
              sortable: false,
              render: (r) => (
                <div className="flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setEditingRow(r)}
                    aria-label={`Corregir inventario de ${rowProductName(r)} en ${rowCompartmentDisplay(r)}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ),
            } as Column<InventoryRow>,
          ]
        : []),
    ],
    [canCorrectInventory],
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Inventario</h2>
        <p className="page-description">
          {canCorrectInventory
            ? "Consulta el stock por ubicación. Los administradores pueden corregir cantidades ante incidencias."
            : canRegisterEntry
              ? "Consulta y registra entradas de stock por ubicación."
              : "Vista de solo lectura del inventario por compartimiento"}
        </p>
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
            {canRegisterEntry ? (
              <Button
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => setEntryModalOpen(true)}
                aria-label="Registrar entrada de stock"
              >
                <Plus className="h-4 w-4" />
                Registrar entrada
              </Button>
            ) : null}
          </div>
        }
      />

      <NewEntryLogDialog open={entryModalOpen} onOpenChange={setEntryModalOpen} />
      <EditInventoryDialog
        row={editingRow}
        onOpenChange={(open) => {
          if (!open) setEditingRow(null);
        }}
      />
    </div>
  );
}
