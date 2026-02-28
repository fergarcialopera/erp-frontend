import { DataTable, Column } from "@/components/DataTable";
import { Progress } from "@/components/ui/progress";

interface InventoryRow {
  id: string;
  compartment: string;
  locker: string;
  product: string;
  qty_available: number;
  qty_reserved: number;
  capacity: number;
}

const sampleInventory: InventoryRow[] = [
  { id: "1", compartment: "A1-01", locker: "LOC-A1", product: "Guantes estériles L", qty_available: 45, qty_reserved: 5, capacity: 100 },
  { id: "2", compartment: "A1-02", locker: "LOC-A1", product: "Jeringa 10ml", qty_available: 120, qty_reserved: 10, capacity: 200 },
  { id: "3", compartment: "B3-01", locker: "LOC-B3", product: "Mascarilla N95", qty_available: 8, qty_reserved: 2, capacity: 50 },
  { id: "4", compartment: "A2-01", locker: "LOC-A2", product: "Alcohol gel 500ml", qty_available: 3, qty_reserved: 1, capacity: 20 },
  { id: "5", compartment: "C1-01", locker: "LOC-C1", product: "Vendaje elástico 10cm", qty_available: 67, qty_reserved: 0, capacity: 80 },
  { id: "6", compartment: "C1-02", locker: "LOC-C1", product: "Suero fisiológico 1L", qty_available: 12, qty_reserved: 3, capacity: 30 },
];

const columns: Column<InventoryRow>[] = [
  { key: "compartment", header: "Compartimiento", sortable: true, render: (r) => <span className="font-mono text-xs">{r.compartment}</span> },
  { key: "locker", header: "Locker", sortable: true, render: (r) => <span className="font-mono text-xs">{r.locker}</span> },
  { key: "product", header: "Producto", sortable: true },
  {
    key: "qty_available",
    header: "Disponible",
    sortable: true,
    render: (r) => {
      const pct = (r.qty_available / r.capacity) * 100;
      const isLow = pct < 20;
      return (
        <div className="flex items-center gap-3 min-w-[120px]">
          <span className={`text-sm font-medium tabular-nums ${isLow ? "text-destructive" : ""}`}>
            {r.qty_available}
          </span>
          <Progress value={pct} className="h-1.5 flex-1" />
        </div>
      );
    },
  },
  {
    key: "qty_reserved",
    header: "Reservado",
    render: (r) => <span className="text-sm tabular-nums text-muted-foreground">{r.qty_reserved}</span>,
  },
];

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Inventario</h2>
        <p className="page-description">Estado actual del inventario por compartimiento</p>
      </div>

      <DataTable
        data={sampleInventory}
        columns={columns}
        searchKey="product"
        searchPlaceholder="Buscar por producto..."
        emptyTitle="Sin inventario"
        emptyDescription="No hay registros de inventario."
      />
    </div>
  );
}
