import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/DataTable";
import { tableCell } from "@/components/tableTypography";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditTablePagination } from "@/features/auditLogs/components/AuditTablePagination";
import { ImportCatalogPreview } from "@/features/productImports/components/ImportCatalogPreview";
import { ImportConflictDiff } from "@/features/productImports/components/ImportConflictDiff";
import { ImportIssueList } from "@/features/productImports/components/ImportIssueList";
import { ImportRowStatusBadge } from "@/features/productImports/components/ImportRowStatusBadge";
import { ImportSessionStatusBadge } from "@/features/productImports/components/ImportSessionStatusBadge";
import { rowDisplayName, rowInternalReference } from "@/features/productImports/api";
import {
  decisionLabel,
  formatImportDate,
  productImportIssueLabel,
} from "@/features/productImports/labels";
import {
  useBulkSetProductImportRowDecision,
  useCancelProductImport,
  useConfirmProductImport,
  useProductImport,
  useProductImportRows,
  useSetProductImportRowDecision,
} from "@/features/productImports/queries";
import type {
  ProductImportDecision,
  ProductImportRow,
  ProductImportRowStatus,
} from "@/features/productImports/types";
import { toastMutationError } from "@/lib/toastMutationError";

type RowFilter = "all" | ProductImportRowStatus;

const FILTER_TABS: { value: RowFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "ready", label: "Listas" },
  { value: "conflict", label: "Conflictos" },
  { value: "invalid", label: "Inválidas" },
  { value: "created", label: "Creadas" },
  { value: "updated", label: "Actualizadas" },
  { value: "failed", label: "Fallidas" },
  { value: "skipped", label: "Omitidas" },
];

function SummaryCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
        {label}
      </div>
      <div className={`text-2xl font-semibold tabular-nums ${accent ?? ""}`}>{value}</div>
    </div>
  );
}

export default function PlatformProductImportDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rowFilter, setRowFilter] = useState<RowFilter>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const {
    data: session,
    isLoading: sessionLoading,
    isError: sessionError,
    refetch: refetchSession,
  } = useProductImport(id || null);

  const rowsParams = useMemo(
    () => ({
      page,
      per_page: perPage,
      ...(rowFilter !== "all" ? { status: rowFilter } : {}),
    }),
    [page, perPage, rowFilter],
  );

  const {
    data: rowsData,
    isLoading: rowsLoading,
    isError: rowsError,
    isFetching: rowsFetching,
    refetch: refetchRows,
  } = useProductImportRows(id || null, rowsParams);

  const conflictCheck = useProductImportRows(id || null, {
    status: "conflict",
    page: 1,
    per_page: 100,
  });

  const setDecision = useSetProductImportRowDecision(id);
  const bulkDecision = useBulkSetProductImportRowDecision(id);
  const confirmMutation = useConfirmProductImport();
  const cancelMutation = useCancelProductImport();

  const rows = rowsData?.data ?? [];
  const rowsMeta = rowsData?.meta ?? { page: 1, per_page: perPage, total: 0 };

  const undecidedConflicts = useMemo(() => {
    const conflicts = conflictCheck.data?.data ?? [];
    const total = conflictCheck.data?.meta.total ?? session?.conflict_count ?? 0;
    if (total === 0) return 0;
    const undecidedOnPage = conflicts.filter((r) => r.decision == null).length;
    const decidedOnPage = conflicts.filter((r) => r.decision != null).length;
    if (conflicts.length < total) {
      // Si no caben todos en una página, asumir pendientes si hay alguno sin decisión
      // o si aún no hemos visto el total decidido.
      return undecidedOnPage > 0 ? undecidedOnPage : Math.max(0, total - decidedOnPage);
    }
    return undecidedOnPage;
  }, [conflictCheck.data, session?.conflict_count]);

  const canReview = session?.status === "ready_for_review";
  const canConfirm = canReview && undecidedConflicts === 0 && !conflictCheck.isLoading;
  const isTerminal =
    session?.status === "completed" ||
    session?.status === "completed_with_errors" ||
    session?.status === "cancelled" ||
    session?.status === "invalid";
  const showResultTabs =
    session?.status === "completed" || session?.status === "completed_with_errors";

  const visibleFilterTabs = FILTER_TABS.filter((tab) => {
    if (
      tab.value === "all" ||
      tab.value === "ready" ||
      tab.value === "conflict" ||
      tab.value === "invalid"
    ) {
      return true;
    }
    return showResultTabs;
  });

  const handleDecision = async (rowId: string, decision: ProductImportDecision) => {
    try {
      await setDecision.mutateAsync({ rowId, decision });
      toast.success("Decisión guardada", { description: decisionLabel(decision) });
    } catch (err) {
      toastMutationError(err, "No se pudo guardar la decisión");
    }
  };

  const handleBulk = async (decision: ProductImportDecision) => {
    try {
      await bulkDecision.mutateAsync({ decision, status: "conflict" });
      toast.success("Decisiones aplicadas", {
        description: `Todos los conflictos: ${decisionLabel(decision)}`,
      });
    } catch (err) {
      toastMutationError(err, "No se pudieron aplicar las decisiones en bloque");
    }
  };

  const handleConfirm = async () => {
    try {
      const detail = await confirmMutation.mutateAsync(id);
      setConfirmOpen(false);
      toast.success(
        detail.status === "completed_with_errors"
          ? "Importación completada con errores"
          : "Importación completada",
        {
          description: `${detail.created_count} creados, ${detail.updated_count} actualizados, ${detail.skipped_count} omitidos, ${detail.failed_count} fallidos.`,
        },
      );
      void conflictCheck.refetch();
    } catch (err) {
      toastMutationError(err, "No se pudo confirmar la importación");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      setCancelOpen(false);
      toast.success("Sesión cancelada");
      navigate("/platform/product-imports");
    } catch (err) {
      toastMutationError(err, "No se pudo cancelar la sesión");
    }
  };

  const columns: Column<ProductImportRow>[] = [
    {
      key: "row_number",
      header: "#",
      render: (row) => <span className={tableCell.numeric}>{row.row_number}</span>,
    },
    {
      key: "name",
      header: "Producto",
      render: (row) => (
        <div>
          <div className={tableCell.primary}>{rowDisplayName(row)}</div>
          <div className={tableCell.mono}>{rowInternalReference(row)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (row) => <ImportRowStatusBadge status={row.status} />,
    },
    {
      key: "warnings",
      header: "Avisos / errores",
      hideBelowMd: true,
      render: (row) => {
        const items = [...row.errors, ...row.warnings];
        if (items.length === 0) return <span className={tableCell.muted}>—</span>;
        return (
          <ul className="space-y-0.5 max-w-xs">
            {items.slice(0, 2).map((issue, i) => (
              <li key={`${row.id}-${issue.code}-${i}`} className={tableCell.secondary}>
                {productImportIssueLabel(issue.code, issue.column)}
              </li>
            ))}
            {items.length > 2 && <li className={tableCell.muted}>+{items.length - 2} más</li>}
          </ul>
        );
      },
    },
    {
      key: "decision",
      header: "Decisión",
      render: (row) => {
        if (row.status === "conflict" && canReview) {
          return (
            <Select
              value={row.decision ?? undefined}
              onValueChange={(v) => void handleDecision(row.id, v as ProductImportDecision)}
              disabled={setDecision.isPending}
            >
              <SelectTrigger className="h-8 w-[180px] text-xs" onClick={(e) => e.stopPropagation()}>
                <SelectValue placeholder="Elegir…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update_existing">Actualizar existente</SelectItem>
                <SelectItem value="create_new">Crear nuevo</SelectItem>
                <SelectItem value="skip">Omitir</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        if (row.decision) {
          return <span className={tableCell.secondary}>{decisionLabel(row.decision)}</span>;
        }
        if (row.result_product_id) {
          return (
            <Link
              to="/platform/products"
              className="text-xs text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
              title={row.result_product_id}
            >
              Ver productos
            </Link>
          );
        }
        return <span className={tableCell.muted}>—</span>;
      },
    },
  ];

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando importación…
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/platform/product-imports")}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
          <p className="font-medium mb-2">No se pudo cargar la importación</p>
          <Button variant="outline" size="sm" onClick={() => void refetchSession()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit"
            onClick={() => navigate("/platform/product-imports")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Importaciones
          </Button>
          <div className="page-header !mb-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="page-title truncate">{session.filename}</h2>
              <ImportSessionStatusBadge status={session.status} />
            </div>
            <p className="page-description">
              {session.created_by_name || session.created_by_email || "—"} ·{" "}
              {formatImportDate(session.created_at)}
            </p>
          </div>
        </div>

        {canReview && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelOpen(true)}
              disabled={cancelMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar sesión
            </Button>
            <Button
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={!canConfirm || confirmMutation.isPending}
              title={
                undecidedConflicts > 0
                  ? `Quedan ${undecidedConflicts} conflicto(s) sin decisión`
                  : undefined
              }
            >
              <Check className="h-4 w-4 mr-1" />
              Confirmar importación
            </Button>
          </div>
        )}
      </div>

      {(session.status === "analyzing" || session.status === "processing") && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {session.status === "analyzing" ? "Analizando el CSV…" : "Aplicando la importación…"}
        </div>
      )}

      {session.status === "invalid" && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Errores estructurales</h3>
          <ImportIssueList issues={session.structural_errors} />
          {session.structural_errors.some((e) => e.code === "wrong_delimiter") && (
            <p className="text-sm text-muted-foreground">
              En Odoo: exportar con separador de punto y coma (;), no coma.
            </p>
          )}
        </section>
      )}

      {(session.status === "completed" || session.status === "completed_with_errors") && (
        <section className="space-y-3 rounded-md border bg-muted/15 px-4 py-3">
          <h3 className="text-sm font-semibold">Resultado</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SummaryCard label="Creados" value={session.created_count} accent="text-success" />
            <SummaryCard label="Actualizados" value={session.updated_count} accent="text-primary" />
            <SummaryCard label="Omitidos" value={session.skipped_count} />
            <SummaryCard
              label="Fallidos"
              value={session.failed_count}
              accent={session.failed_count > 0 ? "text-destructive" : undefined}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Los productos nuevos quedan con visibilidad en clínica desactivada (
            <code className="text-[11px]">visible = false</code>) hasta que un administrador los
            active.
          </p>
        </section>
      )}

      {canReview && (
        <>
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SummaryCard label="Total filas" value={session.total_rows} />
            <SummaryCard label="Listas" value={session.ready_count} accent="text-success" />
            <SummaryCard
              label="Conflictos"
              value={session.conflict_count}
              accent={session.conflict_count > 0 ? "text-[hsl(var(--ll-warning-700))]" : undefined}
            />
            <SummaryCard
              label="Inválidas"
              value={session.invalid_count}
              accent={session.invalid_count > 0 ? "text-destructive" : undefined}
            />
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Catálogo a crear al confirmar</h3>
            <ImportCatalogPreview preview={session.catalog_preview} />
          </section>

          {session.conflict_count > 0 && (
            <section className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2">
              <span className="text-sm text-muted-foreground mr-1">
                Conflictos sin decisión: {undecidedConflicts}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkDecision.isPending}
                onClick={() => void handleBulk("update_existing")}
              >
                Actualizar todos
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkDecision.isPending}
                onClick={() => void handleBulk("create_new")}
              >
                Crear todos nuevos
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={bulkDecision.isPending}
                onClick={() => void handleBulk("skip")}
              >
                Omitir todos
              </Button>
            </section>
          )}
        </>
      )}

      {!isTerminal || showResultTabs || session.status === "ready_for_review" ? (
        <section className="space-y-3">
          <Tabs
            value={rowFilter}
            onValueChange={(v) => {
              setRowFilter(v as RowFilter);
              setPage(1);
              setExpandedRowId(null);
            }}
          >
            <TabsList className="h-auto flex-wrap justify-start">
              {visibleFilterTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                  {tab.label}
                  {tab.value === "ready" && session.ready_count > 0
                    ? ` (${session.ready_count})`
                    : null}
                  {tab.value === "conflict" && session.conflict_count > 0
                    ? ` (${session.conflict_count})`
                    : null}
                  {tab.value === "invalid" && session.invalid_count > 0
                    ? ` (${session.invalid_count})`
                    : null}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <DataTable
            data={rows}
            columns={columns}
            isLoading={rowsLoading}
            isRefreshing={rowsFetching && !rowsLoading}
            isError={rowsError}
            onRetry={() => void refetchRows()}
            searchPlaceholder="Filtrar filas visibles…"
            emptyTitle="Sin filas"
            emptyDescription="No hay filas con este filtro."
            onRowClick={(row) => setExpandedRowId((prev) => (prev === row.id ? null : row.id))}
            hidePagination
            pageSize={perPage}
            footer={
              <AuditTablePagination
                meta={rowsMeta}
                pageSize={perPage}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPerPage(size);
                  setPage(1);
                }}
                isRefreshing={rowsFetching && !rowsLoading}
              />
            }
          />

          {expandedRowId &&
            (() => {
              const row = rows.find((r) => r.id === expandedRowId);
              if (!row) return null;
              return (
                <div className="rounded-md border px-4 py-3 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold">
                      Detalle fila #{row.row_number} · {rowDisplayName(row)}
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedRowId(null)}>
                      Cerrar
                    </Button>
                  </div>
                  {row.status === "conflict" && <ImportConflictDiff diff={row.diff} />}
                  {row.errors.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground">Errores</div>
                      <ImportIssueList issues={row.errors} />
                    </div>
                  )}
                  {row.warnings.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground">Avisos</div>
                      <ImportIssueList issues={row.warnings} variant="warning" />
                    </div>
                  )}
                  {row.result_product_id && (
                    <p className="text-sm">
                      Producto resultante:{" "}
                      <Link to="/platform/products" className="text-primary hover:underline">
                        ir al catálogo
                      </Link>{" "}
                      <span className="text-muted-foreground font-mono text-xs">
                        ({row.result_product_id})
                      </span>
                    </p>
                  )}
                </div>
              );
            })()}
        </section>
      ) : null}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar importación</AlertDialogTitle>
            <AlertDialogDescription>
              Se crearán/actualizarán productos según el análisis. Las filas inválidas no se
              importan. Los productos nuevos quedarán ocultos en clínica hasta activarlos. Esta
              acción no se puede deshacer desde aquí.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirm();
              }}
            >
              {confirmMutation.isPending ? "Confirmando…" : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar sesión</AlertDialogTitle>
            <AlertDialogDescription>
              Se cancelará esta revisión. No se aplicarán cambios al catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>Volver</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void handleCancel();
              }}
            >
              {cancelMutation.isPending ? "Cancelando…" : "Cancelar sesión"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
