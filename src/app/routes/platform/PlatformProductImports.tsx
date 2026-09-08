import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/DataTable";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { AuditTablePagination } from "@/features/auditLogs/components/AuditTablePagination";
import { ImportCsvUploadDialog } from "@/features/productImports/components/ImportCsvUploadDialog";
import { ImportSessionStatusBadge } from "@/features/productImports/components/ImportSessionStatusBadge";
import { formatImportDate } from "@/features/productImports/labels";
import { useProductImports, useUploadProductImport } from "@/features/productImports/queries";
import type { ProductImport } from "@/features/productImports/types";
import { toastMutationError } from "@/lib/toastMutationError";

export default function PlatformProductImportsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data, isLoading, isError, isFetching, refetch } = useProductImports({
    page,
    per_page: perPage,
  });
  const uploadMutation = useUploadProductImport();

  const sessions = data?.data ?? [];
  const meta = data?.meta ?? { page: 1, per_page: perPage, total: 0 };

  const columns: Column<ProductImport>[] = [
    {
      key: "filename",
      header: "Archivo",
      render: (item) => <span className={tableCell.primary}>{item.filename || "—"}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (item) => <ImportSessionStatusBadge status={item.status} />,
    },
    {
      key: "counts_review",
      header: "Listas / Conflictos / Inválidas",
      hideBelowMd: true,
      render: (item) => (
        <span className={tableCell.numeric}>
          {item.ready_count} / {item.conflict_count} / {item.invalid_count}
        </span>
      ),
    },
    {
      key: "counts_result",
      header: "Creados / Act. / Fallos / Om.",
      hideBelowMd: true,
      render: (item) => (
        <span className={tableCell.numeric}>
          {item.created_count} / {item.updated_count} / {item.failed_count} / {item.skipped_count}
        </span>
      ),
    },
    {
      key: "user",
      header: "Usuario",
      hideBelowSm: true,
      render: (item) => (
        <div>
          <div className={tableCell.primary}>{item.created_by_name || "—"}</div>
          {item.created_by_email && <div className={tableCell.muted}>{item.created_by_email}</div>}
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Fecha",
      render: (item) => (
        <span className={tableCell.secondary}>{formatImportDate(item.created_at)}</span>
      ),
    },
  ];

  const handleUpload = async (file: File) => {
    try {
      const detail = await uploadMutation.mutateAsync(file);
      toast.success("CSV analizado", {
        description:
          detail.status === "invalid"
            ? "El archivo tiene errores estructurales."
            : "Revisa el resultado del análisis.",
      });
      setUploadOpen(false);
      navigate(`/platform/product-imports/${detail.id}`);
    } catch (err) {
      toastMutationError(err, "No se pudo subir el CSV");
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Importaciones CSV</h2>
        <p className="page-description">
          Importación de productos desde exportación Odoo (separador «;»). Flujo: subir → revisar →
          confirmar.
        </p>
      </div>

      <DataTable
        data={sessions}
        columns={columns}
        isLoading={isLoading}
        isRefreshing={isFetching && !isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        searchKey="filename"
        searchPlaceholder="Filtrar por nombre de archivo…"
        emptyTitle="Sin importaciones"
        emptyDescription="Sube un CSV de Odoo para crear la primera sesión de importación."
        onRowClick={(item) => navigate(`/platform/product-imports/${item.id}`)}
        headerAction={
          <TableHeaderButton
            label="Nueva importación"
            icon={<Upload />}
            onClick={() => setUploadOpen(true)}
          />
        }
        hidePagination
        pageSize={perPage}
        footer={
          <AuditTablePagination
            meta={meta}
            pageSize={perPage}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPerPage(size);
              setPage(1);
            }}
            isRefreshing={isFetching && !isLoading}
          />
        }
      />

      <ImportCsvUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={handleUpload}
        isUploading={uploadMutation.isPending}
      />
    </div>
  );
}
