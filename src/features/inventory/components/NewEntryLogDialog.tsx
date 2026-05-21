import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/useAuth";
import { productsNewUrl } from "@/features/products/constants";
import { useProducts } from "@/features/products/queries";
import { ProductStockLocationsPanel } from "@/features/products/components/ProductStockLocationsPanel";
import { useLockersTree } from "@/features/lockers/queries";
import { createEntryLog } from "@/features/entryLogs/api";
import { useQueryClient } from "@tanstack/react-query";

const LOCATION_NONE = "__none__";

const entrySchema = z.object({
  product_id: z.string().min(1, "Selecciona un producto"),
  compartment_id: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser mayor a 0").max(999, "Máximo 999"),
  note: z.string().trim().max(120).optional(),
});

type EntryForm = z.infer<typeof entrySchema>;

interface NewEntryLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewEntryLogDialog({ open, onOpenChange }: NewEntryLogDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clinicId, can } = useAuth();
  const canManageProducts = can("ADMIN");
  const { data: products = [] } = useProducts(clinicId);
  const { data: lockerTree = [], isLoading: lockerTreeLoading } = useLockersTree(clinicId, {
    enabled: open,
  });
  const activeProducts = products.filter((p) => p.is_active);
  const activeLockers = lockerTree.filter((l) => l.is_active);
  const [filterLockerId, setFilterLockerId] = useState<string | undefined>();

  const {
    watch,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: { quantity: 1 },
  });

  const selectedLocker = activeLockers.find((l) => l.id === filterLockerId);
  const activeCompartments = (selectedLocker?.compartments ?? []).filter((c) => c.is_active);
  const selectedProductId = watch("product_id");

  useEffect(() => {
    if (open) {
      reset({ quantity: 1, note: "", compartment_id: undefined });
      setFilterLockerId(undefined);
    }
  }, [open, reset]);

  const close = () => onOpenChange(false);

  const goToNewProduct = () => {
    close();
    navigate(productsNewUrl());
  };

  const onSubmit = async (data: EntryForm) => {
    const selectedProduct = products.find((p) => p.id === data.product_id);
    if (!selectedProduct?.sku) {
      toast.error("Producto inválido", {
        description: "No se pudo resolver el SKU del producto seleccionado.",
      });
      return;
    }

    const compartment = data.compartment_id
      ? activeCompartments.find((c) => c.id === data.compartment_id)
      : undefined;

    try {
      await createEntryLog({
        sku: selectedProduct.sku,
        name: selectedProduct.name,
        quantity: data.quantity,
        note: data.note,
        ...(compartment
          ? {
              compartment_id: compartment.id,
              locker_id: compartment.locker_id || filterLockerId,
            }
          : {}),
      });
      toast.success("Entrada registrada", {
        description: "El movimiento de entrada se registró correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["products", "stock-locations"] });
      queryClient.invalidateQueries({ queryKey: ["lockers", "tree", clinicId] });
      close();
    } catch {
      // Error mostrado por interceptor
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva entrada de stock</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="entry-product_id" className="text-xs font-medium">
                Producto a ingresar
              </Label>
              {canManageProducts && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto px-0 text-xs"
                  onClick={goToNewProduct}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir producto
                </Button>
              )}
            </div>
            <Select
              value={watch("product_id")}
              onValueChange={(v) => setValue("product_id", v)}
              disabled={activeProducts.length === 0}
            >
              <SelectTrigger id="entry-product_id" className="h-10" aria-invalid={!!errors.product_id}>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {activeProducts.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product_id && (
              <p className="text-xs text-destructive" role="alert">
                {errors.product_id.message}
              </p>
            )}
            <ProductStockLocationsPanel productId={selectedProductId} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry-filter-locker" className="text-xs font-medium">
                Locker <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Select
                value={filterLockerId ?? LOCATION_NONE}
                onValueChange={(v) => {
                  setFilterLockerId(v === LOCATION_NONE ? undefined : v);
                  setValue("compartment_id", undefined);
                }}
                disabled={lockerTreeLoading || activeLockers.length === 0}
              >
                <SelectTrigger id="entry-filter-locker" className="h-10">
                  <SelectValue placeholder="Todos los lockers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LOCATION_NONE}>Todos los lockers</SelectItem>
                  {activeLockers.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.code}
                      {l.name && l.name !== l.code ? ` — ${l.name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-compartment_id" className="text-xs font-medium">
                Compartimento <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Select
                value={watch("compartment_id") ?? LOCATION_NONE}
                onValueChange={(v) =>
                  setValue("compartment_id", v === LOCATION_NONE ? undefined : v)
                }
                disabled={
                  lockerTreeLoading ||
                  !filterLockerId ||
                  activeCompartments.length === 0
                }
              >
                <SelectTrigger
                  id="entry-compartment_id"
                  className="h-10"
                  aria-invalid={!!errors.compartment_id}
                >
                  <SelectValue
                    placeholder={
                      lockerTreeLoading
                        ? "Cargando lockers…"
                        : !filterLockerId
                          ? "Elige un locker para ubicar"
                          : activeCompartments.length === 0
                            ? "Sin compartimentos en este locker"
                            : "Sin compartimento"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LOCATION_NONE}>Sin compartimento</SelectItem>
                  {activeCompartments.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.code}
                      {c.status === "MAINTENANCE" ? " (mantenimiento)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.compartment_id && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.compartment_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-quantity" className="text-xs font-medium">
              Cantidad
            </Label>
            <Input
              id="entry-quantity"
              type="number"
              min={1}
              max={999}
              className="h-10"
              placeholder="1"
              aria-invalid={!!errors.quantity}
              {...register("quantity")}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive" role="alert">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-note" className="text-xs font-medium">
              Nota  <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="entry-note"
              className="h-10"
              placeholder="Motivo o referencia"
              aria-invalid={!!errors.note}
              {...register("note")}
            />
            {errors.note && (
              <p className="text-xs text-destructive" role="alert">
                {errors.note.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar entrada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
