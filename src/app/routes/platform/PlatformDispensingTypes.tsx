import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable, Column } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  attachRoleToDispensingType,
  createDispensingType,
  deleteDispensingType,
  detachRoleFromDispensingType,
  updateDispensingType,
} from "@/features/catalog/api";
import {
  catalogKeys,
  useDispensingTypeRoles,
  useDispensingTypes,
  useOperationalRoles,
} from "@/features/catalog/queries";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { toastMutationError } from "@/lib/toastMutationError";
import { slugifyName } from "@/lib/slugify";
import type { DispensingType } from "@/types/models";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

type Form = z.infer<typeof schema>;

function DispensingTypeRolesManager({ dispensingTypeId }: { dispensingTypeId: string }) {
  const queryClient = useQueryClient();
  const { data: links = [], isLoading } = useDispensingTypeRoles(dispensingTypeId);
  const { data: roles = [] } = useOperationalRoles(true);
  const [roleId, setRoleId] = useState("");

  const linkedIds = new Set(links.map((l) => l.role_id));
  const available = roles.filter((r) => r.is_active && !linkedIds.has(r.id));

  const attachMutation = useMutation({
    mutationFn: (id: string) => attachRoleToDispensingType(dispensingTypeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: catalogKeys.dispensingTypeRoles(dispensingTypeId),
      });
      toast.success("Rol asociado");
      setRoleId("");
    },
    onError: (err) => toastMutationError(err, "No se pudo asociar el rol"),
  });

  const detachMutation = useMutation({
    mutationFn: (id: string) => detachRoleFromDispensingType(dispensingTypeId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: catalogKeys.dispensingTypeRoles(dispensingTypeId),
      });
      toast.success("Rol desasociado");
    },
    onError: (err) => toastMutationError(err, "No se pudo desasociar el rol"),
  });

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div>
        <h3 className="text-sm font-semibold">Roles permitidos</h3>
        <p className="text-xs text-muted-foreground">
          Roles operativos de locker que pueden usar este tipo de dispensación.
        </p>
      </div>

      <div className="flex gap-2">
        <Select value={roleId || undefined} onValueChange={setRoleId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {available.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!roleId || attachMutation.isPending}
          onClick={() => attachMutation.mutate(roleId)}
        >
          Añadir
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando roles…</p>
      ) : links.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin roles asociados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2 font-medium">Rol</th>
                <th className="py-2 pr-2 font-medium">Slug</th>
                <th className="py-2 font-medium text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b last:border-0">
                  <td className={`py-2 pr-2 ${tableCell.primary}`}>{link.role_name}</td>
                  <td className={`py-2 pr-2 ${tableCell.mono}`}>{link.role_slug}</td>
                  <td className="py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      disabled={detachMutation.isPending}
                      onClick={() => detachMutation.mutate(link.role_id)}
                      aria-label={`Desasociar ${link.role_name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PlatformDispensingTypesPage() {
  const queryClient = useQueryClient();
  const { data: records = [], isLoading, isError, refetch } = useDispensingTypes();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<DispensingType | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "", is_active: true },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog", "dispensing-types"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: Form) =>
      createDispensingType({
        name: data.name,
        slug: data.slug?.trim() || slugifyName(data.name) || null,
        description: data.description?.trim() || null,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Tipo de dispensación creado");
      form.reset({ name: "", slug: "", description: "", is_active: true });
      setSlugManual(false);
      setCreateOpen(false);
    },
    onError: (err) => toastMutationError(err, "No se pudo crear el tipo de dispensación"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Form }) =>
      updateDispensingType(id, {
        name: data.name,
        slug: data.slug?.trim() || null,
        description: data.description?.trim() || null,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Tipo de dispensación actualizado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo actualizar el tipo de dispensación"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDispensingType(id),
    onSuccess: () => {
      invalidate();
      toast.success("Tipo de dispensación desactivado");
      setEditing(null);
    },
    onError: (err) => toastMutationError(err, "No se pudo desactivar el tipo de dispensación"),
  });

  const openCreate = () => {
    setSlugManual(false);
    form.reset({ name: "", slug: "", description: "", is_active: true });
    setCreateOpen(true);
  };

  const openEdit = (item: DispensingType) => {
    setSlugManual(true);
    setEditing(item);
    form.reset({
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      is_active: item.is_active,
    });
  };

  const onNameChange = (value: string) => {
    form.setValue("name", value, { shouldValidate: true });
    if (!slugManual) {
      form.setValue("slug", slugifyName(value), { shouldValidate: true });
    }
  };

  const columns: Column<DispensingType>[] = [
    {
      key: "name",
      header: "NOMBRE",
      sortable: true,
      render: (d) => <span className={tableCell.primary}>{d.name}</span>,
    },
    {
      key: "slug",
      header: "SLUG",
      hideBelowSm: true,
      render: (d) => <span className={tableCell.mono}>{d.slug}</span>,
    },
    {
      key: "description",
      header: "DESCRIPCIÓN",
      hideBelowMd: true,
      render: (d) => <span className={tableCell.muted}>{d.description?.trim() || "—"}</span>,
    },
    {
      key: "is_active",
      header: "ESTADO",
      render: (d) => <StatusBadge status={d.is_active ? "Activo" : "Inactivo"} type="active" />,
    },
    {
      key: "actions",
      header: "",
      render: (d) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => openEdit(d)}
            aria-label={`Editar ${d.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const isEdit = !!editing;
  const dialogOpen = createOpen || isEdit;

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Tipos de dispensación</h2>
        <p className="page-description">
          Catálogo de tipos de dispensación y roles operativos permitidos.
        </p>
      </div>

      <DataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        searchKey="name"
        searchPlaceholder="Buscar tipo..."
        emptyTitle="Sin tipos de dispensación"
        emptyDescription="Crea el primer tipo de dispensación."
        headerAction={<TableHeaderButton label="Nuevo tipo" icon={<Plus />} onClick={openCreate} />}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Editar tipo de dispensación" : "Nuevo tipo de dispensación"}
            </DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Modifica el tipo y gestiona los roles permitidos."
                : "Define nombre, slug y descripción."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) => {
              if (editing) updateMutation.mutate({ id: editing.id, data });
              else createMutation.mutate(data);
            })}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="dispensing-name">Nombre</Label>
              <Input
                id="dispensing-name"
                value={form.watch("name")}
                onChange={(e) => onNameChange(e.target.value)}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispensing-slug">Slug</Label>
              <Input
                id="dispensing-slug"
                {...form.register("slug", {
                  onChange: () => setSlugManual(true),
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dispensing-description">Descripción</Label>
              <Textarea id="dispensing-description" rows={3} {...form.register("description")} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="dispensing-active">Activo</Label>
                <p className="text-xs text-muted-foreground">
                  Si está desactivado, no estará disponible en el catálogo.
                </p>
              </div>
              <Switch
                id="dispensing-active"
                checked={form.watch("is_active")}
                onCheckedChange={(v) => form.setValue("is_active", v)}
              />
            </div>

            {editing && <DispensingTypeRolesManager dispensingTypeId={editing.id} />}

            <DialogFooter className="justify-between sm:justify-between">
              {isEdit && editing && (
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(editing.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Desactivar
                </Button>
              )}
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateOpen(false);
                    setEditing(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Guardando…"
                    : isEdit
                      ? "Guardar"
                      : "Crear"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
