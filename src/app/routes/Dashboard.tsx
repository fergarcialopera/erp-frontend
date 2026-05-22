import { useAuth } from "@/app/providers/useAuth";
import { useDashboard } from "@/features/dashboard/queries";
import { useProductSearch } from "@/features/dashboard/useProductSearch";
import { ProductExitSearch } from "@/features/dashboard/components/ProductExitSearch";
import { ConfirmExitDialog } from "@/features/dashboard/components/ConfirmExitDialog";
import type { ExitDraftItem, ProductSearchItem } from "@/features/dashboard/types";
import { useCreateExitLog } from "@/features/exitLogs/queries";
import {
  buildExitLogCreateItemsFromDraft,
  ExitPickInsufficientStockError,
} from "@/features/exitLogs/buildExitLogCreateItems";
import { mapExitLogDetailToPendingItems } from "@/features/exitLogs/mapExitLogDetailToPendingItems";
import { useDraftExitEditor } from "@/features/exitLogs/useDraftExitEditor";
import { OpenDraftExitButton } from "@/features/exitLogs/components/OpenDraftExitButton";
import { Link } from "react-router-dom";
import { Package, Lock, ClipboardList, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import { ExitStatusBadge } from "@/features/exitLogs/components/ExitStatusBadge";
import { StockLocationsList } from "@/components/StockLocationDisplay";

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
  if (action.type === "clear") {
    return [];
  }
  return state;
}

export default function DashboardPage() {
  const { user, clinicId, canAccessManagement, canAccessOperations } = useAuth();
  const [search, setSearch] = useState("");
  const [draft, dispatch] = useReducer(draftReducer, []);
  const canExecute = canAccessOperations();
  const showKpis = canAccessManagement();
  const draftEditor = useDraftExitEditor(clinicId, canExecute);
  const { results, isLoading: isSearchLoading } = useProductSearch(clinicId, search);
  const createExitMutation = useCreateExitLog();
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    isFetching: dashboardFetching,
    isError,
  } = useDashboard(clinicId, user?.role ?? "STAFF");

  const isLoading = dashboardLoading || dashboardFetching;
  const exits = dashboard?.latest_exits ?? [];
  const isStaff = user?.role === "STAFF";
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
    try {
      const { items: createItems, cache } = await buildExitLogCreateItemsFromDraft(draft);
      const detail = await createExitMutation.mutateAsync({
        note: "Salida desde dashboard",
        items: createItems,
      });

      const created = mapExitLogDetailToPendingItems(detail).map((row) => {
        const source = draft.find((d) => d.productId === row.productId);
        return source ? { ...row, availableStock: source.availableStock } : row;
      });

      if (created.length > 0) {
        await draftEditor.openWithItems(created, cache);
        dispatch({ type: "clear" });
        toast.success("Salida en borrador creada", {
          description: "Revisa el plan de retirada por compartimento y confirma la salida.",
        });
      } else {
        toast.error("No se pudo preparar la salida", {
          description: "Revisa los productos del borrador e inténtalo de nuevo.",
        });
      }
    } catch (error) {
      if (error instanceof ExitPickInsufficientStockError) {
        toast.error("Stock insuficiente", {
          description: `No hay stock suficiente en lockers para ${error.productName}.`,
        });
        return;
      }
      toast.error("No se pudo crear el borrador de salida", {
        description: "Los productos se mantienen en el panel para reintentar.",
      });
    }
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

      {showKpis ? kpiCards : null}

      {/* Salidas de stock recientes */}
      <div className="table-container">
        <div className="p-4 border-b flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold">
              {isStaff ? "Mis salidas recientes" : "Salidas de stock recientes"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isStaff ? "Últimas 5 salidas que has registrado" : "Últimas 5 salidas registradas"}
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link to="/exit-logs">
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
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
                  PRODUCTO
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                  CANTIDAD
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden sm:table-cell">
                  UBICACIÓN
                </th>
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3">
                  ESTADO
                </th>
                {!isStaff ? (
                  <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden md:table-cell">
                    USUARIO
                  </th>
                ) : null}
                <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 hidden md:table-cell">
                  FECHA
                </th>
                <th className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground p-3 w-[100px]">
                  ACCIONES
                </th>
              </tr>
            </thead>
            <tbody>
              {exits.map((exit) => (
                <tr
                  key={exit.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="p-3">
                    <p className="text-sm font-medium leading-snug">{exit.product_summary}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{exit.product_sku}</p>
                  </td>
                  <td className="p-3 text-sm tabular-nums">{exit.total_quantity}</td>
                  <td className="p-3 hidden sm:table-cell">
                    <StockLocationsList locations={exit.locations} />
                  </td>
                  <td className="p-3">
                    <ExitStatusBadge status={exit.status} />
                  </td>
                  {!isStaff ? (
                    <td className="p-3 text-sm hidden md:table-cell">{exit.created_by_name}</td>
                  ) : null}
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                    {formatRequestedAt(exit.created_at)}
                  </td>
                  <td className="p-3 text-right">
                    {exit.status.toUpperCase() === "DRAFT" && canExecute ? (
                      <OpenDraftExitButton
                        exitLogId={exit.id}
                        loading={draftEditor.openingId === exit.id}
                        onOpen={draftEditor.openById}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmExitDialog
        open={draftEditor.open}
        onOpenChange={draftEditor.setOpen}
        items={draftEditor.items}
        productQuantities={draftEditor.productQuantities}
        quantityErrors={draftEditor.quantityErrors}
        hasQuantityErrors={draftEditor.hasQuantityErrors}
        loading={draftEditor.isConfirming}
        onSetProductQty={draftEditor.setProductQuantity}
        onCancelDrafts={draftEditor.cancelPendingDrafts}
        onConfirm={draftEditor.confirmDrafts}
      />
    </div>
  );
}
