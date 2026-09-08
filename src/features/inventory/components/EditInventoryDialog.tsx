import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormDialogFooter } from "@/components/FormDialogFooter";
import { toast } from "sonner";
import { useAuth } from "@/app/providers/useAuth";
import { adjustProductInventory } from "@/features/inventory/api";
import { StockLocationDisplay } from "@/components/StockLocationDisplay";
import { resolveStockLocationLabels } from "@/lib/stockLocation";
import type { ZonaInventory } from "@/types/models";

const editSchema = z.object({
  quantity: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "La cantidad no puede ser negativa"),
});

type EditForm = z.infer<typeof editSchema>;

function rowProductName(r: ZonaInventory): string {
  return r.product?.name ?? r.product_name ?? r.product_id ?? "—";
}

function rowProductSku(r: ZonaInventory): string {
  return r.product?.sku ?? r.product_sku ?? r.product_id ?? "—";
}

interface EditInventoryDialogProps {
  row: ZonaInventory | null;
  onOpenChange: (open: boolean) => void;
}

export function EditInventoryDialog({ row, onOpenChange }: EditInventoryDialogProps) {
  const queryClient = useQueryClient();
  const { clinicId } = useAuth();
  const open = !!row;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: { quantity: 0 },
  });

  useEffect(() => {
    if (row) {
      reset({ quantity: row.qty_available });
    }
  }, [row, reset]);

  const mutation = useMutation({
    mutationFn: (data: EditForm) => {
      const productId = row?.product_id ?? row?.product?.id;
      if (!productId) {
        throw new Error("Producto no identificado");
      }
      const zoneId = row?.zone_id || row?.zone?.id;
      return adjustProductInventory(productId, {
        locations: [
          {
            quantity: data.quantity,
            zone_id: zoneId ? zoneId : null,
          },
        ],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["products", "stock-locations"] });
      toast.success("Inventario corregido", {
        description: "Las cantidades de la ubicación se actualizaron correctamente.",
      });
      onOpenChange(false);
    },
  });

  const onSubmit = (data: EditForm) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Corregir inventario</DialogTitle>
          <DialogDescription asChild>
            {row && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Ajuste manual para incidencias. Solo administradores pueden modificar el stock en
                  esta ubicación.
                </p>
                <p>
                  <span className="text-foreground font-medium">{rowProductName(row)}</span>
                  {" · "}
                  <span className="font-mono text-xs">{rowProductSku(row)}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Ubicación:</span>
                  <StockLocationDisplay {...resolveStockLocationLabels(row.ambiente, row.zone, row)} />
                </div>
                <p>
                  Reservado actual:{" "}
                  <strong className="text-foreground tabular-nums">{row.qty_reserved}</strong>
                  <span className="block text-xs mt-1">
                    La reserva no se modifica desde este formulario; solo la cantidad disponible.
                  </span>
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        {row && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="edit-inventory-quantity">Disponible (nuevo valor)</Label>
              <Input
                id="edit-inventory-quantity"
                type="number"
                min={0}
                className="h-10"
                autoFocus
                aria-invalid={!!errors.quantity}
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.quantity.message}
                </p>
              )}
            </div>

            <FormDialogFooter
              submitLabel={isSubmitting || mutation.isPending ? "Guardando…" : "Guardar corrección"}
              isPending={isSubmitting || mutation.isPending}
              onCancel={() => onOpenChange(false)}
            />
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
