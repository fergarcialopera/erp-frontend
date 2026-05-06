import { useAuth } from "@/app/providers/useAuth";
import { useDashboard } from "@/features/dashboard/queries";
import { useProductSearch } from "@/features/dashboard/useProductSearch";
import { ProductExitSearch } from "@/features/dashboard/components/ProductExitSearch";
import { ConfirmExitDialog } from "@/features/dashboard/components/ConfirmExitDialog";
import type { ExitDraftItem, PendingExitItem, ProductSearchItem } from "@/features/dashboard/types";
import {
  useCancelExitLog,
  useConfirmExitLog,
  useCreateExitLog,
  useUpdateExitLog,
} from "@/features/exitLogs/queries";
import { useQueryClient } from "@tanstack/react-query";
import { Package, Lock, ClipboardList, AlertTriangle } from "lucide-react";
import type { ExitLog } from "@/types/models";
import { useMemo, useReducer, useState } from "react";
import { toast } from "sonner";

function exitProductSku(o: ExitLog): string {
  return o.product?.sku ?? o.product_sku ?? o.sku ?? o.product_id ?? "—";
}
function exitLockerName(o: ExitLog): string {
  return o.locker?.name ?? o.locker_name ?? o.locker?.code ?? o.locker_id ?? "—";
}
function exitRequestedByName(o: ExitLog): string {
  return o.requested_by?.name ?? o.requested_by_user_name ?? o.requested_by_user_id ?? "—";
}

type DraftAction =
  | { type: "addItem"; item: ProductSearchItem }
  | { type: "setItems"; items: ExitDraftItem[] }
  | { type: "updateQty"; productId: string; quantity: number }
  | { type: "removeItem"; productId: string }
  | { type: "clear" };

function draftReducer(state: ExitDraftItem[], action: DraftAction): ExitDraftItem[] {
  if (action.type === "addItem") {
    const existing = state.find((it) => it.productId === action.item.productId);
    if (existing) {
      return state.map((it) =>
        it.productId === action.item.productId
          ? { ...it, quantity: Math.max(1, it.quantity + 1) }
          : it,
      );
    }
    return [...state, { ...action.item, quantity: 1 }];
  }
  if (action.type === "updateQty") {
    return state.map((it) =>
      it.productId === action.productId ? { ...it, quantity: Math.max(1, action.quantity) } : it,
    );
  }
  if (action.type === "removeItem") {
    return state.filter((it) => it.productId !== action.productId);
  }
  if (action.type === "setItems") {
    return action.items;
  }
  return [];
}

export default function DashboardPage() {
  const { user, clinicId } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [draft, dispatch] = useReducer(draftReducer, []);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingExitItem[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { results, isLoading: isSearchLoading } = useProductSearch(clinicId, search);
  const createExitMutation = useCreateExitLog();
  const updateExitMutation = useUpdateExitLog();
  const confirmExitMutation = useConfirmExitLog();
  const cancelExitMutation = useCancelExitLog();
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    isError,
  } = useDashboard(clinicId);

  const isLoading = dashboardLoading || dashboardFetching;
  const exits = dashboard?.latest_exits ?? [];
  const canExecute = user?.role === "ADMIN" || user?.role === "TECHNICIAN" || user?.role === "STAFF";
  const isOperationalRole = user?.role === "STAFF" || user?.role === "TECHNICIAN";
  const isConfirming =
    updateExitMutation.isPending || confirmExitMutation.isPending || cancelExitMutation.isPending;

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

  const executeDraft = async () => {
    if (!canExecute || draft.length === 0) return;
    const results = await Promise.allSettled(
      draft.map((item) =>
        createExitMutation.mutateAsync({
          sku: item.sku,
          quantity: item.quantity,
          note: `Dashboard quick exit - ${item.name}`,
        }),
      ),
    );

    const created: PendingExitItem[] = [];
    const failedProductIds = new Set<string>();

    results.forEach((result, idx) => {
      const source = draft[idx];
      if (result.status === "fulfilled" && result.value.id) {
        created.push({
          ...source,
          exitLogId: result.value.id,
          confirmedQuantity: source.quantity,
        });
      } else {
        failedProductIds.add(source.productId);
      }
    });

    if (created.length > 0) {
      setPendingConfirmation(created);
      setConfirmDialogOpen(true);
    }

    if (failedProductIds.size > 0) {
      toast.error("Algunas salidas no se pudieron crear", {
        description: "Los productos con error se mantienen en el borrador para reintento.",
      });
    } else {
      toast.success("Salida en borrador creada", {
        description: "Revisa cantidades reales y confirma la salida.",
      });
    }

    const failedItems = draft.filter((item) => failedProductIds.has(item.productId));
    dispatch({ type: "setItems", items: failedItems });
  };

  const confirmDrafts = async () => {
    if (pendingConfirmation.length === 0 || !canExecute) return;
    const failedIds = new Set<string>();

    for (const item of pendingConfirmation) {
      try {
        if (item.confirmedQuantity !== item.quantity) {
          await updateExitMutation.mutateAsync({
            id: item.exitLogId,
            payload: { quantity: item.confirmedQuantity },
          });
        }
        await confirmExitMutation.mutateAsync(item.exitLogId);
      } catch {
        failedIds.add(item.exitLogId);
      }
    }

    if (failedIds.size > 0) {
      setPendingConfirmation((prev) => prev.filter((item) => failedIds.has(item.exitLogId)));
      toast.error("No se pudieron confirmar todas las salidas", {
        description: "Se conservan en el resumen para volver a intentar.",
      });
      return;
    }

    setPendingConfirmation([]);
    setConfirmDialogOpen(false);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["dashboard", clinicId] }),
      queryClient.invalidateQueries({ queryKey: ["exit-logs", clinicId] }),
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] }),
    ]);
    toast.success("Salida confirmada", {
      description: "Las cantidades reales se han confirmado correctamente.",
    });
  };

  const cancelPendingDrafts = async () => {
    if (pendingConfirmation.length === 0 || !canExecute) return;
    const failedIds = new Set<string>();
    for (const item of pendingConfirmation) {
      try {
        await cancelExitMutation.mutateAsync(item.exitLogId);
      } catch {
        failedIds.add(item.exitLogId);
      }
    }
    if (failedIds.size > 0) {
      setPendingConfirmation((prev) => prev.filter((item) => failedIds.has(item.exitLogId)));
      toast.error("No se pudieron cancelar todos los borradores");
      return;
    }
    setPendingConfirmation([]);
    setConfirmDialogOpen(false);
    toast.success("Borradores cancelados");
  };

  const kpiCards = useMemo(
    () => (
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
              Salidas registradas
            </span>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? "…" : dashboard?.pending_exits_count ?? "—"}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Últimas salidas de stock</p>
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
    ),
    [dashboard, isLoading],
  );

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Bienvenido, {user?.name?.split(" ")[0] || "Usuario"}</h2>
        <p className="page-description">Resumen operativo del sistema</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ProductExitSearch
            search={search}
            onSearchChange={setSearch}
            results={results}
            isLoading={isSearchLoading}
            canExecute={canExecute}
            onAdd={(item) => dispatch({ type: "addItem", item })}
            draftItems={draft}
            onUpdateDraftQty={(productId, quantity) => dispatch({ type: "updateQty", productId, quantity })}
            onRemoveDraftItem={(productId) => dispatch({ type: "removeItem", productId })}
            onExecuteDraft={executeDraft}
            isExecuting={createExitMutation.isPending}
          />
        </div>
        <div />
      </div>

      {!isOperationalRole ? kpiCards : null}

      {/* Salidas de stock recientes */}
      <div className="table-container">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Salidas de stock recientes</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Últimos movimientos de salida registrados</p>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Cargando…
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No se pudieron cargar los datos del dashboard. Vuelve a intentarlo más tarde.
          </div>
        ) : exits.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No hay salidas de stock registradas
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Las salidas de stock aparecerán aquí cuando existan.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                  REFERENCIA
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                  CANTIDAD
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden sm:table-cell">
                  LOCKER
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                  ESTADO
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden md:table-cell">
                  USUARIO
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden md:table-cell">
                  RETIRADO
                </th>
              </tr>
            </thead>
            <tbody>
              {exits.map((exit) => (
                <tr
                  key={exit.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3 text-sm font-mono text-xs">
                    {exitProductSku(exit)}
                  </td>
                  <td className="p-3 text-sm tabular-nums">{exit.quantity}</td>
                  <td className="p-3 text-sm hidden sm:table-cell">
                    {exitLockerName(exit)}
                  </td>
                  <td className="p-3 text-sm">Registrado</td>
                  <td className="p-3 text-sm hidden md:table-cell">
                    {exitRequestedByName(exit)}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                    {formatRequestedAt(exit.created_at ?? "")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isOperationalRole ? kpiCards : null}

      <ConfirmExitDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        items={pendingConfirmation}
        loading={isConfirming}
        onSetQty={(exitLogId, quantity) =>
          setPendingConfirmation((prev) =>
            prev.map((item) =>
              item.exitLogId === exitLogId ? { ...item, confirmedQuantity: Math.max(0, quantity) } : item,
            ),
          )
        }
        onCancelDrafts={cancelPendingDrafts}
        onConfirm={confirmDrafts}
      />
    </div>
  );
}
