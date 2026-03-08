import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/providers/useAuth";
import { useInventory } from "@/features/inventory/queries";
import { addInventory, removeInventory, deleteInventoryEntry } from "@/features/inventory/api";
import { useLockers } from "@/features/lockers/queries";
import { useProducts } from "@/features/products/queries";
import { fetchCompartmentsByLocker } from "@/features/compartments/api";
import { useNavigate } from "react-router-dom";
import { ClipboardList, PackagePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { CompartmentInventory } from "@/types/models";

/** Fila de inventario con datos enriquecidos para mostrar nombres */
type InventoryRow = CompartmentInventory & {
  locker_code?: string;
  compartment_name?: string;
  product_name?: string;
  product_sku?: string;
};

const quantitySchema = z.object({
  quantity: z.coerce.number().int().min(1, "Indica al menos 1 unidad"),
});

const newInventorySchema = z.object({
  locker_id: z.string().min(1, "Selecciona un locker"),
  compartment_id: z.string().min(1, "Selecciona un compartimento"),
  product_id: z.string().min(1, "Selecciona un producto"),
  quantity: z.coerce.number().int().min(1, "Indica al menos 1 unidad"),
});

type QuantityForm = z.infer<typeof quantitySchema>;
type NewInventoryForm = z.infer<typeof newInventorySchema>;

type AdjustMode = "add" | "withdraw";

const baseColumns = (
  onAdd: (row: InventoryRow) => void,
  onWithdraw: (row: InventoryRow) => void,
  onDelete: (row: InventoryRow) => void,
  canDelete: boolean
): Column<InventoryRow>[] => [
  {
    key: "locker_code",
    header: "LOCKER",
    sortable: true,
    render: (r) => (
      <span className="text-sm font-mono">{r.locker_code ?? r.locker_id ?? "—"}</span>
    ),
  },
  {
    key: "compartment_name",
    header: "COMPARTIMENTO",
    sortable: true,
    render: (r) => (
      <span className="text-sm">{r.compartment_name ?? r.compartment_code ?? r.compartment_id ?? "—"}</span>
    ),
  },
  {
    key: "product_sku",
    header: "ID PRODUCTO",
    sortable: true,
    render: (r) => (
      <span className="font-mono text-xs text-muted-foreground">
        {r.product_sku ?? r.product_id ?? "—"}
      </span>
    ),
  },
  {
    key: "product_name",
    header: "PRODUCTO",
    sortable: true,
    render: (r) => (
      <span className="text-sm">{r.product_name ?? r.product_id ?? "—"}</span>
    ),
  },
  {
    key: "qty_available",
    header: "DISPONIBILIDAD",
    sortable: true,
    render: (r) => (
      <span className="text-sm font-medium tabular-nums">
        {r.qty_available} ({r.qty_reserved})
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    sortable: false,
    render: (r) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => onWithdraw(r)}
          aria-label={`Retirar unidades de ${r.product_name ?? r.product_id}`}
        >
          Retirar
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onAdd(r)}
          aria-label={`Añadir unidades de ${r.product_name ?? r.product_id}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        {canDelete && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(r)}
            aria-label={`Eliminar entrada de ${r.product_name ?? r.product_id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    ),
  },
];

export default function InventoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clinicId, can } = useAuth();
  /** Solo ADMIN puede eliminar entradas; RESPONSABLE solo puede retirar o añadir. */
  const canDeleteEntry = can("ADMIN");
  const {
    data: inventory = [],
    isLoading: inventoryLoading,
    isFetching: inventoryFetching,
    isError,
    refetch,
  } = useInventory(clinicId);
  const {
    data: lockers = [],
    isLoading: lockersLoading,
    isFetching: lockersFetching,
  } = useLockers(clinicId);
  const {
    data: products = [],
    isLoading: productsLoading,
    isFetching: productsFetching,
  } = useProducts(clinicId, { activeOnly: false });

  const [adjustModal, setAdjustModal] = useState<{
    row: InventoryRow;
    mode: AdjustMode;
  } | null>(null);
  const [newInventoryModalOpen, setNewInventoryModalOpen] = useState(false);
  const [deleteConfirmRow, setDeleteConfirmRow] = useState<InventoryRow | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<QuantityForm>({
    resolver: zodResolver(quantitySchema),
    defaultValues: { quantity: 1 },
  });

  const newInventoryForm = useForm<NewInventoryForm>({
    resolver: zodResolver(newInventorySchema),
    defaultValues: { locker_id: "", compartment_id: "", product_id: "", quantity: 1 },
  });
  const selectedNewLockerId = newInventoryForm.watch("locker_id");

  const compartmentQueries = useQueries({
    queries: lockers.map((locker) => ({
      queryKey: ["compartments", locker.id],
      queryFn: () => fetchCompartmentsByLocker(locker.id),
    })),
  });

  const records: InventoryRow[] = useMemo(() => {
    const allCompartments = compartmentQueries.flatMap((q) => q.data ?? []);
    const compartmentMap = new Map(allCompartments.map((c) => [c.id, c]));
    const lockerMap = new Map(lockers.map((l) => [l.id, l]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    return inventory.map((row) => {
      const compartment = compartmentMap.get(row.compartment_id);
      const locker = compartment ? lockerMap.get(compartment.locker_id) : undefined;
      const product = productMap.get(row.product_id);
      return {
        ...row,
        locker_id: compartment?.locker_id ?? row.locker_id,
        locker_code: locker?.code ?? row.locker_code,
        compartment_name: compartment?.code ?? row.compartment_name ?? row.compartment_code,
        product_name: product?.name ?? row.product_name,
        product_sku: product?.sku ?? row.product_sku,
      };
    });
  }, [inventory, lockers, products, compartmentQueries]);

  const addMutation = useMutation({
    mutationFn: (params: { compartment_id: string; product_id: string; quantity: number }) =>
      addInventory(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] });
      toast.success("Unidades añadidas", {
        description: "El inventario se ha actualizado correctamente.",
      });
      setAdjustModal(null);
      setNewInventoryModalOpen(false);
      reset({ quantity: 1 });
      newInventoryForm.reset({ locker_id: "", compartment_id: "", product_id: "", quantity: 1 });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (params: { compartment_id: string; product_id: string; quantity: number }) =>
      removeInventory(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] });
      toast.success("Unidades retiradas", {
        description: "El stock disponible se ha actualizado.",
      });
      setAdjustModal(null);
      reset({ quantity: 1 });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id: string) => deleteInventoryEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] });
      setDeleteConfirmRow(null);
      toast.success("Entrada eliminada", {
        description: "La entrada de inventario se ha eliminado correctamente.",
      });
    },
  });

  const activeLockers = useMemo(() => lockers.filter((l) => l.is_active), [lockers]);
  const activeProducts = useMemo(() => products.filter((p) => p.is_active), [products]);
  const compartmentsForNewLocker = useMemo(() => {
    if (!selectedNewLockerId) return [];
    const idx = lockers.findIndex((l) => l.id === selectedNewLockerId);
    if (idx < 0) return [];
    const list = compartmentQueries[idx]?.data ?? [];
    return list.filter((c) => c.status === "AVAILABLE" && c.is_active);
  }, [lockers, selectedNewLockerId, compartmentQueries]);

  const openAdjustModal = (row: InventoryRow, mode: AdjustMode) => {
    setAdjustModal({ row, mode });
    reset({ quantity: 1 });
  };

  const closeAdjustModal = () => {
    setAdjustModal(null);
    reset({ quantity: 1 });
  };

  const openNewInventoryModal = () => {
    newInventoryForm.reset({ locker_id: "", compartment_id: "", product_id: "", quantity: 1 });
    setNewInventoryModalOpen(true);
  };

  const onNewInventoryLockerChange = (value: string) => {
    newInventoryForm.setValue("locker_id", value);
    newInventoryForm.setValue("compartment_id", "");
  };

  const onNewInventorySubmit = (data: NewInventoryForm) => {
    addMutation.mutate({
      compartment_id: data.compartment_id,
      product_id: data.product_id,
      quantity: data.quantity,
    });
  };

  const onSubmit = (data: QuantityForm) => {
    if (!adjustModal) return;
    if (adjustModal.mode === "withdraw" && data.quantity > adjustModal.row.qty_available) {
      setError("quantity", {
        type: "manual",
        message: `Máximo ${adjustModal.row.qty_available} unidades disponibles`,
      });
      return;
    }
    const params = {
      compartment_id: adjustModal.row.compartment_id,
      product_id: adjustModal.row.product_id,
      quantity: data.quantity,
    };
    if (adjustModal.mode === "add") {
      addMutation.mutate(params);
    } else {
      removeMutation.mutate(params);
    }
  };

  const handleDeleteEntry = (row: InventoryRow) => {
    setDeleteConfirmRow(row);
  };

  const confirmDeleteEntry = () => {
    if (deleteConfirmRow) {
      deleteEntryMutation.mutate(deleteConfirmRow.id);
    }
  };

  const columns = useMemo(
    () => baseColumns(
      (row) => openAdjustModal(row, "add"),
      (row) => openAdjustModal(row, "withdraw"),
      handleDeleteEntry,
      canDeleteEntry
    ),
    [canDeleteEntry]
  );

  const compartmentsLoading = compartmentQueries.some((q) => q.isLoading || q.isFetching);
  const isLoading =
    inventoryLoading ||
    inventoryFetching ||
    lockersLoading ||
    lockersFetching ||
    productsLoading ||
    productsFetching ||
    compartmentsLoading;

  const isAdd = adjustModal?.mode === "add";

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Inventario</h2>
        <p className="page-description">Estado actual del inventario por compartimiento</p>
      </div>

      <DataTable
        data={records}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="product_name"
        searchPlaceholder="Buscar por producto..."
        emptyTitle="Sin inventario"
        emptyDescription="No hay registros de inventario."
        headerAction={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => navigate("/open-orders")}
              aria-label="Ver órdenes de retirada"
            >
              <ClipboardList className="h-4 w-4" />
              Órdenes de retirada
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5"
              onClick={openNewInventoryModal}
              aria-label="Añadir producto al inventario"
            >
              <PackagePlus className="h-4 w-4" />
              Añadir producto al inventario
            </Button>
          </div>
        }
      />

      <Dialog open={!!adjustModal} onOpenChange={(open) => !open && closeAdjustModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isAdd ? "Añadir unidades" : "Retirar unidades"}</DialogTitle>
            <DialogDescription asChild>
              {adjustModal && (
                <div className="space-y-2">
                  <p>
                    {isAdd
                      ? "Indica cuántas unidades quieres añadir al inventario."
                      : "Indica cuántas unidades quieres retirar del stock disponible."}
                    {" "}
                    Producto: <strong>{adjustModal.row.product_name ?? adjustModal.row.product_id}</strong>
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Locker: <strong className="text-foreground font-mono">{adjustModal.row.locker_code ?? adjustModal.row.locker_id ?? "—"}</strong>
                    {" · "}
                    Compartimento: <strong className="text-foreground font-mono">{adjustModal.row.compartment_name ?? adjustModal.row.compartment_code ?? adjustModal.row.compartment_id ?? "—"}</strong>
                    {" · "}
                    Unidades actuales: <strong className="text-foreground">{adjustModal.row.qty_available}</strong>
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          {adjustModal && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adjust-quantity">Unidades</Label>
                <Input
                  id="adjust-quantity"
                  type="number"
                  min={1}
                  max={adjustModal.mode === "withdraw" ? adjustModal.row.qty_available : undefined}
                  autoFocus
                  {...register("quantity")}
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive">{errors.quantity.message}</p>
                )}
                {!isAdd && (
                  <p className="text-xs text-muted-foreground">
                    Disponibles: {adjustModal.row.qty_available}
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeAdjustModal}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (isAdd ? addMutation.isPending : removeMutation.isPending)
                  }
                >
                  {isAdd
                    ? addMutation.isPending ? "Añadiendo…" : "Añadir"
                    : removeMutation.isPending ? "Retirando…" : "Retirar"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={newInventoryModalOpen} onOpenChange={setNewInventoryModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir producto al inventario</DialogTitle>
            <DialogDescription>
              Elige un locker y compartimento disponibles, un producto activo y las unidades a añadir.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={newInventoryForm.handleSubmit(onNewInventorySubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Locker</Label>
              <Select
                value={selectedNewLockerId}
                onValueChange={onNewInventoryLockerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar locker" />
                </SelectTrigger>
                <SelectContent>
                  {activeLockers.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.code} — {l.name}
                    </SelectItem>
                  ))}
                  {activeLockers.length === 0 && (
                    <SelectItem value="_none" disabled>
                      No hay lockers disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {newInventoryForm.formState.errors.locker_id && (
                <p className="text-xs text-destructive">
                  {newInventoryForm.formState.errors.locker_id.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Compartimento</Label>
              <Select
                value={newInventoryForm.watch("compartment_id")}
                onValueChange={(v) => newInventoryForm.setValue("compartment_id", v)}
                disabled={!selectedNewLockerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar compartimento" />
                </SelectTrigger>
                <SelectContent>
                  {compartmentsForNewLocker.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code}
                    </SelectItem>
                  ))}
                  {selectedNewLockerId && compartmentsForNewLocker.length === 0 && (
                    <SelectItem value="_none" disabled>
                      No hay compartimentos disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {newInventoryForm.formState.errors.compartment_id && (
                <p className="text-xs text-destructive">
                  {newInventoryForm.formState.errors.compartment_id.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Producto</Label>
              <Select
                value={newInventoryForm.watch("product_id")}
                onValueChange={(v) => newInventoryForm.setValue("product_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {activeProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.sku} — {p.name}
                    </SelectItem>
                  ))}
                  {activeProducts.length === 0 && (
                    <SelectItem value="_none" disabled>
                      No hay productos activos
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {newInventoryForm.formState.errors.product_id && (
                <p className="text-xs text-destructive">
                  {newInventoryForm.formState.errors.product_id.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-inventory-quantity">Unidades</Label>
              <Input
                id="new-inventory-quantity"
                type="number"
                min={1}
                {...newInventoryForm.register("quantity")}
              />
              {newInventoryForm.formState.errors.quantity && (
                <p className="text-xs text-destructive">
                  {newInventoryForm.formState.errors.quantity.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewInventoryModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  newInventoryForm.formState.isSubmitting || addMutation.isPending
                }
              >
                {addMutation.isPending ? "Añadiendo…" : "Añadir al inventario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirmRow} onOpenChange={(open) => !open && setDeleteConfirmRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar entrada de inventario</AlertDialogTitle>
            <AlertDialogDescription asChild>
              {deleteConfirmRow && (
                <div className="space-y-2">
                  <p>
                    ¿Eliminar esta entrada? Se borrará la fila de inventario para{" "}
                    <strong>{deleteConfirmRow.product_name ?? deleteConfirmRow.product_id}</strong> en{" "}
                    <strong className="font-mono">{deleteConfirmRow.locker_code ?? deleteConfirmRow.locker_id}</strong>
                    {" / "}
                    <strong className="font-mono">{deleteConfirmRow.compartment_name ?? deleteConfirmRow.compartment_id}</strong>.
                  </p>
                  <p className="text-foreground font-medium">
                    Cantidad actual: <strong>{deleteConfirmRow.qty_available}</strong> disponibles
                    {deleteConfirmRow.qty_reserved > 0 && (
                      <> y <strong>{deleteConfirmRow.qty_reserved}</strong> reservadas</>
                    )}.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEntry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEntryMutation.isPending}
            >
              {deleteEntryMutation.isPending ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
