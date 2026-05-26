import { useMemo, useState } from "react";
import { NewEntryLogDialog } from "@/features/inventory/components/NewEntryLogDialog";
import { EditInventoryDialog } from "@/features/inventory/components/EditInventoryDialog";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/providers/useAuth";
import { useInventory } from "@/features/inventory/queries";
import { useNavigate } from "react-router-dom";
import { ClipboardList, PackagePlus, Pencil, Plus } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { StockLocationDisplay } from "@/components/StockLocationDisplay";
import { formatStockLocationPlain, resolveStockLocationLabels } from "@/lib/stockLocation";
import type { CompartmentInventory } from "@/types/models";

function rowLocationLabels(r: CompartmentInventory) {
  return resolveStockLocationLabels(r.locker, r.compartment, r);
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
    render: (r) => <span className={tableCell.primary}>{rowProductName(r)}</span>,
  },
  {
    key: "product_sku",
    header: "SKU",
    sortable: true,
    render: (r) => <span className={`${tableCell.mono} text-muted-foreground`}>{rowProductSku(r)}</span>,
  },
  {
    key: "location_label",
    header: "UBICACIÓN",
    sortable: true,
    render: (r) => {
      const labels = rowLocationLabels(r);
      return <StockLocationDisplay locker={labels.locker} compartment={labels.compartment} />;
    },
  },
  {
    key: "qty_available",
    header: "DISPONIBLE",
    sortable: true,
    render: (r) => <span className={`${tableCell.numeric} font-medium`}>{r.qty_available}</span>,
  },
  {
    key: "qty_reserved",
    header: "RESERVADO",
    sortable: true,
    hideBelowSm: true,
    render: (r) => <span className={tableCell.numeric}>{r.qty_reserved}</span>,
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
        location_label: formatStockLocationPlain(rowLocationLabels(r)),
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
                    aria-label={`Corregir inventario de ${rowProductName(r)} en ${formatStockLocationPlain(rowLocationLabels(r))}`}
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
          <>
            <TableHeaderButton
              variant="outline"
              label="Ver salidas"
              icon={<ClipboardList />}
              onClick={() => navigate("/exit-logs")}
            />
            <TableHeaderButton
              variant="outline"
              label="Registrar salida"
              icon={<PackagePlus />}
              onClick={() => navigate("/exit-logs/new")}
            />
            {canRegisterEntry ? (
              <TableHeaderButton
                label="Registrar entrada"
                icon={<Plus />}
                onClick={() => setEntryModalOpen(true)}
              />
            ) : null}
          </>
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
