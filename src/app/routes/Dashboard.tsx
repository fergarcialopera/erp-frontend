import { useAuth } from "@/app/providers/useAuth";
import { useDashboard } from "@/features/dashboard/queries";
import { StatusBadge } from "@/components/StatusBadge";
import { Package, Lock, ClipboardList, AlertTriangle } from "lucide-react";
import type { OpenOrder } from "@/types/models";

export default function DashboardPage() {
  const { user, clinicId } = useAuth();
  const { data: dashboard, isLoading, isError } = useDashboard(clinicId);

  const orders: OpenOrder[] = dashboard?.latest_orders ?? [];

  const formatRequestedAt = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3600_000);
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Bienvenido, {user?.name?.split(" ")[0] || "Usuario"}</h2>
        <p className="page-description">Resumen operativo del sistema</p>
      </div>

      {/* Estadísticas desde GET /dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Productos
            </span>
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? "…" : dashboard?.active_products_count ?? "—"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Productos activos</p>
        </div>
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Lockers
            </span>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? "…" : dashboard?.available_lockers_count ?? "—"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Lockers disponibles</p>
        </div>
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Órdenes pendientes
            </span>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? "…" : dashboard?.pending_orders_count ?? "—"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Solicitudes de apertura</p>
        </div>
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Inventario bajo
            </span>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? "…" : dashboard?.has_low_stock != null ? (dashboard.has_low_stock ? "Sí" : "No") : "—"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Requiere atención</p>
        </div>
      </div>

      {/* Órdenes recientes desde GET /dashboard */}
      <div className="table-container">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Órdenes recientes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimas solicitudes de apertura</p>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Cargando…
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No se pudieron cargar los datos del dashboard. Vuelve a intentarlo más tarde.
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No hay órdenes de apertura registradas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Las solicitudes de apertura de compartimientos aparecerán aquí cuando existan.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                  Referencia
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                  Cantidad
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden sm:table-cell">
                  Locker
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                  Estado
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden md:table-cell">
                  Solicitado
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: OpenOrder) => (
                <tr
                  key={order.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3 text-sm font-mono text-xs">{order.external_ref}</td>
                  <td className="p-3 text-sm tabular-nums">{order.quantity}</td>
                  <td className="p-3 text-sm font-mono text-xs hidden sm:table-cell">
                    {order.locker_id}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={order.status} type="order" />
                  </td>
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                    {formatRequestedAt(order.requested_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
