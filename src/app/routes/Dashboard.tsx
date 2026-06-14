import { useAuth } from "@/app/providers/useAuth";
import { getUserFirstName } from "@/lib/userDisplay";
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
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableHeaderButtonLabel, tableHeaderButtonClassName } from "@/components/TableHeaderButton";
import { TABLE_HEAD_CLASS, tableCell } from "@/components/tableTypography";
import { useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import { ExitStatusBadge } from "@/features/exitLogs/components/ExitStatusBadge";
import { StockLocationPicksList } from "@/components/StockLocationDisplay";

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
  const { user, clinicId, canAccessOperations } = useAuth();
  const [search, setSearch] = useState("");
  const [draft, dispatch] = useReducer(draftReducer, []);
  const canExecute = canAccessOperations();
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
  const primaryRowExitIds = useMemo(() => {
    const seen = new Set<string>();
    const ids = new Set<string>();
    for (const row of exits) {
      if (!seen.has(row.exitLogId)) {
        seen.add(row.exitLogId);
        ids.add(row.exitLogId);
      }
    }
    return ids;
  }, [exits]);
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
          description: "Revisa el plan de retirada por zona y confirma la salida.",
        });
      } else {
        toast.error("No se pudo preparar la salida", {
          description: "Revisa los productos del borrador e inténtalo de nuevo.",
        });
      }
    } catch (error) {
      if (error instanceof ExitPickInsufficientStockError) {
        toast.error("Stock insuficiente", {
          description: `No hay stock suficiente en ambientes para ${error.productName}.`,
        });
        return;
      }
      toast.error("No se pudo crear el borrador de salida", {
        description: "Los productos se mantienen en el panel para reintentar.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Bienvenido, {getUserFirstName(user)}</h2>
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
          <Button
            variant="outline"
            size="sm"
            className={tableHeaderButtonClassName}
            asChild
          >
            <Link to="/exit-logs" aria-label="Ver todas las salidas">
              <TableHeaderButtonLabel label="Ver todas" />
              <ArrowRight className="h-4 w-4" />
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
          <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] sm:min-w-[32rem]">
            <thead>
              <tr className="border-b">
                <th className={`text-left ${TABLE_HEAD_CLASS} px-2 py-2 sm:px-3 sm:py-2.5`}>
                  PRODUCTO
                </th>
                <th className={`text-left ${TABLE_HEAD_CLASS} px-2 py-2 sm:px-3 sm:py-2.5`}>
                  CANTIDAD
                </th>
                <th className={`text-left ${TABLE_HEAD_CLASS} px-2 py-2 sm:px-3 sm:py-2.5 hidden sm:table-cell`}>
                  UBICACIÓN
                </th>
                <th className={`text-left ${TABLE_HEAD_CLASS} px-2 py-2 sm:px-3 sm:py-2.5`}>
                  ESTADO
                </th>
                {!isStaff ? (
                  <th className={`text-left ${TABLE_HEAD_CLASS} px-2 py-2 sm:px-3 sm:py-2.5 hidden md:table-cell`}>
                    USUARIO
                  </th>
                ) : null}
                <th className={`text-left ${TABLE_HEAD_CLASS} px-2 py-2 sm:px-3 sm:py-2.5 hidden md:table-cell`}>
                  FECHA
                </th>
                <th className={`text-right ${TABLE_HEAD_CLASS} px-2 py-2 sm:px-3 sm:py-2.5 w-[72px] sm:w-[100px]`}>
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
                  <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                    <p className={tableCell.primary}>{exit.productName}</p>
                    <p className={`${tableCell.mono} text-muted-foreground mt-0.5`}>{exit.productSku}</p>
                  </td>
                  <td className={`px-2 py-2 sm:px-3 sm:py-2.5 ${tableCell.numeric}`}>
                    {exit.totalQuantity}
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-2.5 hidden sm:table-cell">
                    <StockLocationPicksList picks={exit.locationPicks} />
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-2.5">
                    <ExitStatusBadge status={exit.status} />
                  </td>
                  {!isStaff ? (
                    <td className={`px-2 py-2 sm:px-3 sm:py-2.5 hidden md:table-cell ${tableCell.primary}`}>
                      {exit.created_by_name}
                    </td>
                  ) : null}
                  <td className={`px-2 py-2 sm:px-3 sm:py-2.5 hidden md:table-cell ${tableCell.muted}`}>
                    {formatRequestedAt(exit.created_at)}
                  </td>
                  <td className="px-2 py-2 sm:px-3 sm:py-2.5 text-right">
                    {exit.status.toUpperCase() === "DRAFT" &&
                    canExecute &&
                    primaryRowExitIds.has(exit.exitLogId) ? (
                      <OpenDraftExitButton
                        exitLogId={exit.exitLogId}
                        loading={draftEditor.openingId === exit.exitLogId}
                        onOpen={draftEditor.openById}
                      />
                    ) : (
                      <span className={tableCell.muted}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
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
