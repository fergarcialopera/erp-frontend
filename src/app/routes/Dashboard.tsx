import { useAuth } from "@/app/providers/AuthContext";
import { Package, Lock, ClipboardList, Warehouse, Users, AlertTriangle } from "lucide-react";

const stats = [
  { label: "Productos", value: "124", icon: Package, change: "+3 esta semana" },
  { label: "Lockers", value: "18", icon: Lock, change: "2 en mantenimiento" },
  { label: "Órdenes pendientes", value: "7", icon: ClipboardList, change: "3 hoy" },
  { label: "Inventario bajo", value: "5", icon: AlertTriangle, change: "Requiere atención" },
];

const recentOrders = [
  {
    id: "ORD-001",
    product: "Guantes estériles L",
    locker: "LOC-A1",
    status: "PENDING",
    time: "Hace 12 min",
  },
  {
    id: "ORD-002",
    product: "Jeringa 10ml",
    locker: "LOC-B3",
    status: "RETIRED",
    time: "Hace 45 min",
  },
  {
    id: "ORD-003",
    product: "Mascarilla N95",
    locker: "LOC-A2",
    status: "PENDING",
    time: "Hace 1h",
  },
  {
    id: "ORD-004",
    product: "Alcohol gel 500ml",
    locker: "LOC-C1",
    status: "CANCELLED",
    time: "Hace 2h",
  },
  {
    id: "ORD-005",
    product: "Vendaje elástico",
    locker: "LOC-A1",
    status: "RETIRED",
    time: "Hace 3h",
  },
];

const statusStyles: Record<string, string> = {
  PENDING: "bg-accent/15 text-accent",
  RETIRED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-muted/50 text-muted-foreground/70",
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Bienvenido, {user?.name?.split(" ")[0] || "Usuario"}</h2>
        <p className="page-description">Resumen operativo del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-[11px] text-muted-foreground mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="table-container">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Órdenes recientes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimas solicitudes de apertura</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                Referencia
              </th>
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                Producto
              </th>
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden sm:table-cell">
                Locker
              </th>
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                Estado
              </th>
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden md:table-cell">
                Tiempo
              </th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="p-3 text-sm font-mono text-xs">{order.id}</td>
                <td className="p-3 text-sm">{order.product}</td>
                <td className="p-3 text-sm font-mono text-xs hidden sm:table-cell">
                  {order.locker}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${statusStyles[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                  {order.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
