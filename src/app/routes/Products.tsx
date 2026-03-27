import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProducts } from "@/features/products/queries";
import { createProduct, updateProduct, deleteProduct } from "@/features/products/api";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types/models";
import { AxiosError } from "axios";

const newProductSchema = z.object({
  sku: z.string().trim().min(1, "El SKU es obligatorio").max(255),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  barcode: z.string().trim().max(255).optional().or(z.literal("")),
});

const editProductSchema = z.object({
  sku: z.string().trim().min(1, "El SKU es obligatorio").max(255),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  barcode: z.string().trim().max(255).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type NewProductForm = z.infer<typeof newProductSchema>;
type EditProductForm = z.infer<typeof editProductSchema>;

const baseColumns: Column<Product>[] = [
  {
    key: "sku",
    header: "SKU",
    sortable: true,
    render: (p) => <span className="font-mono text-xs">{p.sku}</span>,
  },
  { key: "name", header: "NOMBRE", sortable: true },
  {
    key: "barcode",
    header: "CÓDIGO BARRAS",
    render: (p) => (
      <span className="font-mono text-xs text-muted-foreground">{p.barcode || "—"}</span>
    ),
  },
  {
    key: "is_active",
    header: "ESTADO",
    render: (p) => <StatusBadge status={p.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { clinicId, can } = useAuth();
  const {
    data: records,
    isLoading: productsLoading,
    isFetching: productsFetching,
    isError,
    refetch,
  } = useProducts(clinicId, { activeOnly: false });
  const isLoading = productsLoading || productsFetching;
  const canEdit = can("TECHNICIAN");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<NewProductForm>({
    resolver: zodResolver(newProductSchema),
    defaultValues: { sku: "", name: "", barcode: "" },
  });

  const editForm = useForm<EditProductForm>({
    resolver: zodResolver(editProductSchema),
    defaultValues: { sku: "", name: "", barcode: "", is_active: true },
  });

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    editForm.reset({
      sku: product.sku,
      name: product.name,
      barcode: product.barcode ?? "",
      is_active: product.is_active,
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
  };

  const columns: Column<Product>[] = [
    ...baseColumns,
    ...(canEdit
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
                  onClick={() => openEditModal(p)}
                  aria-label={`Editar ${p.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          } as Column<Product>,
        ]
      : []),
  ];

  const createMutation = useMutation({
    mutationFn: (data: NewProductForm) =>
      createProduct({
        sku: data.sku,
        name: data.name,
        barcode: data.barcode?.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", clinicId] });
      toast.success("Producto creado", {
        description: "El producto se ha registrado correctamente.",
      });
      reset({ sku: "", name: "", barcode: "" });
      setModalOpen(false);
    },
    onError: (err: AxiosError<{ errors?: Record<string, string[]>; message?: string }>) => {
      const payload = err.response?.data;
      if (err.response?.status === 422 && payload?.errors) {
        Object.entries(payload.errors).forEach(([field, messages]) => {
          const key = field as keyof NewProductForm;
          if (["sku", "name", "barcode"].includes(field) && messages?.[0]) {
            setError(key, { type: "server", message: messages[0] });
          }
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditProductForm }) =>
      updateProduct(id, {
        sku: data.sku,
        name: data.name,
        barcode: data.barcode?.trim() || undefined,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", clinicId] });
      toast.success("Producto actualizado", {
        description: "Los cambios se han guardado correctamente.",
      });
      closeEditModal();
    },
    onError: (err: AxiosError<{ errors?: Record<string, string[]> }>) => {
      const payload = err.response?.data;
      if (err.response?.status === 422 && payload?.errors) {
        Object.entries(payload.errors).forEach(([field, messages]) => {
          const key = field as keyof EditProductForm;
          if (["sku", "name", "barcode", "is_active"].includes(field) && messages?.[0]) {
            editForm.setError(key, { type: "server", message: messages[0] });
          }
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", clinicId] });
      toast.success("Producto desactivado", {
        description: "El producto ha sido desactivado correctamente.",
      });
      closeEditModal();
    },
  });

  const onSubmit = (data: NewProductForm) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: EditProductForm) => {
    if (editingProduct) updateMutation.mutate({ id: editingProduct.id, data });
  };

  const handleDeleteProduct = () => {
    if (editingProduct) deleteMutation.mutate(editingProduct.id);
  };

  const openModal = () => {
    reset({ sku: "", name: "", barcode: "" });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <p className="page-description">Catálogo de productos registrados en el sistema</p>
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
        headerAction={
          canEdit ? (
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={openModal}
              aria-label="Nuevo producto"
            >
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Button>
          ) : undefined
        }
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
            <DialogDescription>
              Introduce SKU y nombre. El código de barras es opcional.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-product-sku">SKU</Label>
              <Input
                id="new-product-sku"
                placeholder="Ej. PROD-001"
                autoComplete="off"
                {...register("sku")}
              />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-product-name">Nombre</Label>
              <Input
                id="new-product-name"
                placeholder="Nombre del producto"
                autoComplete="off"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-product-barcode">Código de barras (opcional)</Label>
              <Input
                id="new-product-barcode"
                placeholder="EAN, UPC, etc."
                autoComplete="off"
                {...register("barcode")}
              />
              {errors.barcode && (
                <p className="text-xs text-destructive">{errors.barcode.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? "Creando…" : "Crear producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editingProduct !== null} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Modifica los datos del producto. Puedes desactivarlo con el botón Eliminar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-product-sku">SKU</Label>
              <Input
                id="edit-product-sku"
                placeholder="Ej. PROD-001"
                autoComplete="off"
                {...editForm.register("sku")}
              />
              {editForm.formState.errors.sku && (
                <p className="text-xs text-destructive">{editForm.formState.errors.sku.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-name">Nombre</Label>
              <Input
                id="edit-product-name"
                placeholder="Nombre del producto"
                autoComplete="off"
                {...editForm.register("name")}
              />
              {editForm.formState.errors.name && (
                <p className="text-xs text-destructive">{editForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product-barcode">Código de barras (opcional)</Label>
              <Input
                id="edit-product-barcode"
                placeholder="EAN, UPC, etc."
                autoComplete="off"
                {...editForm.register("barcode")}
              />
              {editForm.formState.errors.barcode && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.barcode.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="edit-product-active">Producto activo</Label>
                <p className="text-xs text-muted-foreground">
                  Si está desactivado, no aparecerá en listas activas.
                </p>
              </div>
              <Switch
                id="edit-product-active"
                checked={editForm.watch("is_active")}
                onCheckedChange={(checked) => editForm.setValue("is_active", checked)}
              />
            </div>
            <DialogFooter className="flex-row justify-between sm:justify-between">
              <Button
                type="button"
                variant="destructive"
                className="mr-auto gap-1.5"
                onClick={handleDeleteProduct}
                disabled={updateMutation.isPending || deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                {deleteMutation.isPending ? "Desactivando…" : "Eliminar"}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={closeEditModal}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    editForm.formState.isSubmitting || updateMutation.isPending || deleteMutation.isPending
                  }
                >
                  {updateMutation.isPending ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
