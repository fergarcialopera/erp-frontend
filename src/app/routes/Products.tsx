import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/features/products/queries";
import { patchClinicProductSettingsByClinic } from "@/features/clinics/api";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/providers/useAuth";
import { Settings2 } from "lucide-react";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { Product } from "@/types/models";
import {
  PRODUCTS_NEW_QUERY_PARAM,
  PRODUCTS_NEW_QUERY_VALUE,
} from "@/features/products/constants";

function resolveClinicVisible(product: Product): boolean {
  return product.is_visible === true;
}

function catalogStatusLabel(product: Product): string {
  return product.is_active ? "Activo" : "Inactivo";
}

function clinicVisibilityLabel(product: Product): string {
  if (!product.is_active) return "Catálogo inactivo";
  return resolveClinicVisible(product) ? "Visible" : "No visible";
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clinicId, canToggleProductClinicSettings } = useAuth();
  const {
    data: records,
    isLoading: productsLoading,
    isFetching: productsFetching,
    isError,
    refetch,
  } = useProducts(clinicId, { activeOnly: false });
  const isLoading = productsLoading || productsFetching;
  const canConfigureClinic = canToggleProductClinicSettings();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [clinicVisible, setClinicVisible] = useState(false);

  const baseColumns: Column<Product>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      render: (p) => <span className={tableCell.mono}>{p.sku}</span>,
    },
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (p) => <span className={tableCell.primary}>{p.name}</span>,
    },
    {
      key: "barcode",
      header: "CÓDIGO BARRAS",
      hideBelowMd: true,
      render: (p) => (
        <span className={`${tableCell.mono} text-muted-foreground`}>{p.barcode || "—"}</span>
      ),
    },
    {
      key: "is_active",
      header: "CATÁLOGO",
      render: (p) => (
        <StatusBadge
          status={catalogStatusLabel(p)}
          type={p.is_active ? "active" : "inactive"}
        />
      ),
    },
    {
      key: "is_visible",
      header: "EN CLÍNICA",
      render: (p) => (
        <StatusBadge
          status={clinicVisibilityLabel(p)}
          type={p.is_active && resolveClinicVisible(p) ? "active" : "inactive"}
        />
      ),
    },
  ];

  const openClinicSettings = (product: Product) => {
    setEditingProduct(product);
    setClinicVisible(resolveClinicVisible(product));
  };

  const closeClinicSettings = () => {
    setEditingProduct(null);
  };

  const columns: Column<Product>[] = [
    ...baseColumns,
    ...(canConfigureClinic
      ? [
          {
            key: "actions",
            header: "",
            sortable: false,
            render: (p) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openClinicSettings(p)}
                  disabled={!p.is_active}
                  aria-label={`Configurar visibilidad de ${p.name}`}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          } as Column<Product>,
        ]
      : []),
  ];

  const settingsMutation = useMutation({
    mutationFn: async ({ productId, visible }: { productId: string; visible: boolean }) => {
      if (!clinicId) {
        throw new Error("Missing clinic context");
      }
      return patchClinicProductSettingsByClinic(clinicId, productId, { visible });
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData<Product[]>(["products", clinicId, false], (current) =>
        current?.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)),
      );
      queryClient.invalidateQueries({ queryKey: ["products", clinicId] });
      toast.success("Visibilidad actualizada", {
        description: `«${updatedProduct.name}» — ${updatedProduct.is_visible ? "visible" : "oculto"} en esta clínica.`,
      });
      closeClinicSettings();
    },
  });

  const handleSaveClinicSettings = () => {
    if (!editingProduct || !clinicId) return;
    settingsMutation.mutate({
      productId: editingProduct.id,
      visible: clinicVisible,
    });
  };

  useEffect(() => {
    if (searchParams.get(PRODUCTS_NEW_QUERY_PARAM) !== PRODUCTS_NEW_QUERY_VALUE) return;
    const next = new URLSearchParams(searchParams);
    next.delete(PRODUCTS_NEW_QUERY_PARAM);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <p className="page-description">
          El estado de catálogo lo gestiona el super administrador. En esta clínica, la visibilidad
          determina si el producto puede usarse en operaciones (entradas, salidas, inventario).
        </p>
      </div>

      <DataTable
        data={records || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar producto..."
        emptyTitle="Sin productos"
        emptyDescription="No hay productos registrados aún."
      />

      <Dialog open={editingProduct !== null} onOpenChange={(open) => !open && closeClinicSettings()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Visibilidad en clínica</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? `«${editingProduct.name}» — catálogo ${editingProduct.is_active ? "activo" : "inactivo"}.`
                : "Configuración del producto para esta clínica."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm">
              <p className="font-medium">Catálogo</p>
              <p className="text-muted-foreground text-xs mt-1">
                Activo o inactivo a nivel global. Solo el super administrador puede modificarlo.
              </p>
              <p className="mt-2">
                <StatusBadge
                  status={editingProduct ? catalogStatusLabel(editingProduct) : "—"}
                  type={editingProduct?.is_active ? "active" : "inactive"}
                />
              </p>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="clinic-product-visible">Visible en clínica</Label>
                <p className="text-xs text-muted-foreground">
                  Si está visible, el producto puede utilizarse en operaciones de esta clínica.
                </p>
              </div>
              <Switch
                id="clinic-product-visible"
                checked={clinicVisible}
                onCheckedChange={setClinicVisible}
                disabled={!editingProduct?.is_active}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeClinicSettings}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveClinicSettings}
              disabled={settingsMutation.isPending || !editingProduct?.is_active}
            >
              {settingsMutation.isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
