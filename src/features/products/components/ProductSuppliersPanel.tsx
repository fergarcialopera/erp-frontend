import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addProductSupplier,
  deleteProductSupplier,
  setPreferredProductSupplier,
  updateProductSupplier,
} from "@/features/products/api";
import { useProductSuppliers } from "@/features/products/queries";
import { useSuppliers } from "@/features/catalog/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormDialogFooter } from "@/components/FormDialogFooter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, Pencil, Plus } from "lucide-react";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { toastMutationError } from "@/lib/toastMutationError";
import type { ProductSupplierLink } from "@/types/models";

const linkSchema = z.object({
  supplier_id: z.string().uuid("Selecciona un proveedor"),
  supplier_reference: z.string().trim().max(255).optional().or(z.literal("")),
  purchase_price: z.string().optional().or(z.literal("")),
  pvp: z.string().optional().or(z.literal("")),
  net_cost: z.string().optional().or(z.literal("")),
  is_preferred: z.boolean(),
});

type LinkForm = z.infer<typeof linkSchema>;

function parseOptionalNumber(value: string | undefined): number | null | undefined {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ProductSuppliersPanelProps {
  productId: string;
}

export function ProductSuppliersPanel({ productId }: ProductSuppliersPanelProps) {
  const queryClient = useQueryClient();
  const { data: links = [], isLoading } = useProductSuppliers(productId);
  const { data: suppliers = [] } = useSuppliers();
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<ProductSupplierLink | null>(null);

  const form = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      supplier_id: "",
      supplier_reference: "",
      purchase_price: "",
      pvp: "",
      net_cost: "",
      is_preferred: false,
    },
  });

  const editForm = useForm<LinkForm>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      supplier_id: "",
      supplier_reference: "",
      purchase_price: "",
      pvp: "",
      net_cost: "",
      is_preferred: false,
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["products", productId, "suppliers"] });
    queryClient.invalidateQueries({ queryKey: ["products", "detail", productId] });
    queryClient.invalidateQueries({ queryKey: ["products", "platform"] });
  };

  const addMutation = useMutation({
    mutationFn: (data: LinkForm) =>
      addProductSupplier(productId, {
        supplier_id: data.supplier_id,
        supplier_reference: data.supplier_reference?.trim() || null,
        purchase_price: parseOptionalNumber(data.purchase_price),
        pvp: parseOptionalNumber(data.pvp),
        net_cost: parseOptionalNumber(data.net_cost),
        is_preferred: data.is_preferred,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Proveedor asociado");
      form.reset();
      setAddOpen(false);
    },
    onError: (err) => toastMutationError(err, "No se pudo asociar el proveedor"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LinkForm }) =>
      updateProductSupplier(productId, id, {
        supplier_id: data.supplier_id,
        supplier_reference: data.supplier_reference?.trim() || null,
        purchase_price: parseOptionalNumber(data.purchase_price),
        pvp: parseOptionalNumber(data.pvp),
        net_cost: parseOptionalNumber(data.net_cost),
        is_preferred: data.is_preferred,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Proveedor actualizado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo actualizar el proveedor"),
  });

  const deleteMutation = useMutation({
    mutationFn: (linkId: string) => deleteProductSupplier(productId, linkId),
    onSuccess: () => {
      invalidate();
      toast.success("Proveedor desasociado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo desasociar el proveedor"),
  });

  const preferredMutation = useMutation({
    mutationFn: (linkId: string) => setPreferredProductSupplier(productId, linkId),
    onSuccess: () => {
      invalidate();
      toast.success("Proveedor preferente actualizado");
    },
    onError: (err) => toastMutationError(err, "No se pudo marcar como preferente"),
  });

  const linkedIds = new Set(links.map((l) => l.supplier_id));
  const availableSuppliers = suppliers.filter((s) => s.is_active && !linkedIds.has(s.id));

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Proveedores del producto</h3>
          <p className="text-xs text-muted-foreground">
            Referencias, precios y proveedor preferente.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => {
            form.reset({
              supplier_id: "",
              supplier_reference: "",
              purchase_price: "",
              pvp: "",
              net_cost: "",
              is_preferred: false,
            });
            setAddOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando proveedores…</p>
      ) : links.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin proveedores asociados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2 font-medium">Proveedor</th>
                <th className="py-2 pr-2 font-medium">Ref.</th>
                <th className="py-2 pr-2 font-medium">Compra</th>
                <th className="py-2 pr-2 font-medium">PVP</th>
                <th className="py-2 pr-2 font-medium">Neto</th>
                <th className="py-2 pr-2 font-medium">Pref.</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b last:border-0">
                  <td className={`py-2 pr-2 ${tableCell.primary}`}>{link.name}</td>
                  <td className={`py-2 pr-2 ${tableCell.mono}`}>
                    {link.supplier_reference || "—"}
                  </td>
                  <td className="py-2 pr-2">{formatMoney(link.purchase_price)}</td>
                  <td className="py-2 pr-2">{formatMoney(link.pvp)}</td>
                  <td className="py-2 pr-2">{formatMoney(link.net_cost)}</td>
                  <td className="py-2 pr-2">
                    {link.is_preferred ? (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => preferredMutation.mutate(link.id)}
                        aria-label={`Marcar ${link.name} como preferente`}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditing(link);
                          editForm.reset({
                            supplier_id: link.supplier_id,
                            supplier_reference: link.supplier_reference ?? "",
                            purchase_price:
                              link.purchase_price != null ? String(link.purchase_price) : "",
                            pvp: link.pvp != null ? String(link.pvp) : "",
                            net_cost: link.net_cost != null ? String(link.net_cost) : "",
                            is_preferred: link.is_preferred,
                          });
                        }}
                        aria-label={`Editar ${link.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir proveedor</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit((d) => addMutation.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Select
                value={form.watch("supplier_id") || undefined}
                onValueChange={(v) => form.setValue("supplier_id", v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar…" />
                </SelectTrigger>
                <SelectContent>
                  {availableSuppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.supplier_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.supplier_id.message}
                </p>
              )}
            </div>
            <SupplierLinkFields form={form} />
            <FormDialogFooter
              submitLabel="Añadir"
              isPending={addMutation.isPending}
              onCancel={() => setAddOpen(false)}
            />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar proveedor</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((d) => {
              if (editing) updateMutation.mutate({ id: editing.id, data: d });
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Proveedor</Label>
              <Input value={editing?.name ?? ""} disabled />
            </div>
            <SupplierLinkFields form={editForm} />
            <FormDialogFooter
              submitLabel="Guardar"
              isPending={updateMutation.isPending}
              onCancel={() => setEditing(null)}
              destructiveAction={{
                label: "Eliminar",
                onClick: () => editing && deleteMutation.mutate(editing.id),
                isPending: deleteMutation.isPending,
              }}
            />
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SupplierLinkFields({ form }: { form: ReturnType<typeof useForm<LinkForm>> }) {
  return (
    <>
      <div className="space-y-2">
        <Label>Referencia proveedor</Label>
        <Input {...form.register("supplier_reference")} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Precio compra</Label>
          <Input type="number" step="0.01" {...form.register("purchase_price")} />
        </div>
        <div className="space-y-2">
          <Label>PVP</Label>
          <Input type="number" step="0.01" {...form.register("pvp")} />
        </div>
        <div className="space-y-2">
          <Label>Coste neto</Label>
          <Input type="number" step="0.01" {...form.register("net_cost")} />
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <Label>Preferente</Label>
        <Switch
          checked={form.watch("is_preferred")}
          onCheckedChange={(v) => form.setValue("is_preferred", v)}
        />
      </div>
    </>
  );
}
