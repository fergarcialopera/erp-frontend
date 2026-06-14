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
import { useAmbientesTree } from "@/features/ambientes/queries";
import { createEntryLog } from "@/features/entryLogs/api";
import { useQueryClient } from "@tanstack/react-query";

const LOCATION_NONE = "__none__";

const entrySchema = z.object({
  product_id: z.string().min(1, "Selecciona un producto"),
  zone_id: z.string().optional(),
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
  const { clinicId, canAccessManagement } = useAuth();
  const canManageProducts = canAccessManagement();
  const { data: products = [] } = useProducts(clinicId);
  const { data: ambienteTree = [], isLoading: ambienteTreeLoading } = useAmbientesTree(clinicId, {
    enabled: open,
  });
  const activeProducts = products.filter((p) => p.is_active);
  const activeAmbientes = ambienteTree.filter((a) => a.is_active);
  const [filterAmbienteId, setFilterAmbienteId] = useState<string | undefined>();

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

  const selectedAmbiente = activeAmbientes.find((a) => a.id === filterAmbienteId);
  const activeZones = (selectedAmbiente?.zones ?? []).filter((z) => z.is_active);
  const selectedProductId = watch("product_id");

  useEffect(() => {
    if (open) {
      reset({ quantity: 1, note: "", zone_id: undefined });
      setFilterAmbienteId(undefined);
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

    const zone = data.zone_id
      ? activeZones.find((z) => z.id === data.zone_id)
      : undefined;

    try {
      await createEntryLog({
        sku: selectedProduct.sku,
        name: selectedProduct.name,
        quantity: data.quantity,
        note: data.note,
        ...(zone
          ? {
              zone_id: zone.id,
              ambiente_id: zone.ambiente_id || filterAmbienteId,
            }
          : {}),
      });
      toast.success("Entrada registrada", {
        description: "El movimiento de entrada se registró correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["products", "stock-locations"] });
      queryClient.invalidateQueries({ queryKey: ["ambientes", "tree", clinicId] });
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
              <Label htmlFor="entry-filter-ambiente" className="text-xs font-medium">
                Ambiente <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Select
                value={filterAmbienteId ?? LOCATION_NONE}
                onValueChange={(v) => {
                  setFilterAmbienteId(v === LOCATION_NONE ? undefined : v);
                  setValue("zone_id", undefined);
                }}
                disabled={ambienteTreeLoading || activeAmbientes.length === 0}
              >
                <SelectTrigger id="entry-filter-ambiente" className="h-10">
                  <SelectValue placeholder="Todos los ambientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LOCATION_NONE}>Todos los ambientes</SelectItem>
                  {activeAmbientes.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry-zone_id" className="text-xs font-medium">
                Zona <span className="text-muted-foreground font-normal">(opcional)</span>
              </Label>
              <Select
                value={watch("zone_id") ?? LOCATION_NONE}
                onValueChange={(v) =>
                  setValue("zone_id", v === LOCATION_NONE ? undefined : v)
                }
                disabled={
                  ambienteTreeLoading ||
                  !filterAmbienteId ||
                  activeZones.length === 0
                }
              >
                <SelectTrigger
                  id="entry-zone_id"
                  className="h-10"
                  aria-invalid={!!errors.zone_id}
                >
                  <SelectValue
                    placeholder={
                      ambienteTreeLoading
                        ? "Cargando ambientes…"
                        : !filterAmbienteId
                          ? "Elige un ambiente para ubicar"
                          : activeZones.length === 0
                            ? "Sin zonas en este ambiente"
                            : "Sin zona"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LOCATION_NONE}>Sin zona</SelectItem>
                  {activeZones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.zone_id && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.zone_id.message}
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
