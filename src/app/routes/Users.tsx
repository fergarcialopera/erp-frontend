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
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useAuth } from "@/app/providers/useAuth";
import { useUsers } from "@/features/users/queries";
import { createUser, updateUser } from "@/features/users/api";
import { Pencil, Plus } from "lucide-react";
import { TableHeaderButton } from "@/components/TableHeaderButton";
import { TABLE_CHIP_CLASS, tableCell } from "@/components/tableTypography";
import { toast } from "sonner";
import { User, Role, ClinicAssignableRole } from "@/types/models";

const roleStyles: Record<string, string> = {
  SUPER_ADMIN: "bg-primary/15 text-primary border-primary/25",
  ADMIN: "bg-accent/15 text-accent border-accent/25",
  TECHNICIAN: "bg-soft/30 text-soft-foreground border-soft/40",
  STAFF: "bg-muted text-muted-foreground border-border",
};

const baseColumns: Column<User>[] = [
  {
    key: "name",
    header: "NOMBRE",
    sortable: true,
    render: (u) => (
      <div className="min-w-0">
        <span className={tableCell.primary}>{u.name}</span>
        <span className={`sm:hidden block ${tableCell.muted} truncate`}>{u.email}</span>
      </div>
    ),
  },
  {
    key: "email",
    header: "EMAIL",
    hideBelowSm: true,
    render: (u) => <span className={tableCell.muted}>{u.email}</span>,
  },
  {
    key: "role",
    header: "ROL",
    render: (u) => (
      <span className={`${TABLE_CHIP_CLASS} ${roleStyles[u.role]}`}>{u.role}</span>
    ),
  },
  {
    key: "is_active",
    header: "ESTADO",
    render: (u) => <StatusBadge status={u.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

const newUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  email: z.string().trim().email("Email no válido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128),
  role: z.enum(["ADMIN", "TECHNICIAN", "STAFF"] as const),
  is_active: z.boolean(),
});

const editUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  email: z.string().trim().email("Email no válido").max(255),
  role: z.enum(["ADMIN", "TECHNICIAN", "STAFF"] as const),
  is_active: z.boolean(),
});

type NewUserForm = z.infer<typeof newUserSchema>;
type EditUserForm = z.infer<typeof editUserSchema>;

const CLINIC_ROLES: ClinicAssignableRole[] = ["ADMIN", "TECHNICIAN", "STAFF"];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { clinicId, canManageUsers } = useAuth();
  const {
    data: records = [],
    isLoading: usersLoading,
    isFetching: usersFetching,
    isError,
    refetch,
  } = useUsers(clinicId, { allowWithoutClinic: true });
  const isLoading = usersLoading || usersFetching;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const canEdit = canManageUsers();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<NewUserForm>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { role: "STAFF", is_active: true },
  });

  const createMutation = useMutation({
    mutationFn: (data: NewUserForm) =>
      createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", clinicId] });
      toast.success("Usuario creado", { description: "El usuario se ha registrado correctamente." });
      reset({ name: "", email: "", password: "", role: "STAFF", is_active: true });
      setModalOpen(false);
    },
  });

  const onSubmit = (data: NewUserForm) => {
    createMutation.mutate(data);
  };

  const openModal = () => {
    reset({ name: "", email: "", password: "", role: "STAFF", is_active: true });
    setModalOpen(true);
  };

  const isActive = watch("is_active");

  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { name: "", email: "", role: "STAFF", is_active: true },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditUserForm }) =>
      updateUser(id, {
        name: data.name,
        email: data.email,
        role: data.role,
        is_active: data.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", clinicId] });
      toast.success("Usuario actualizado", {
        description: "Los cambios se han guardado correctamente.",
      });
      setEditingUser(null);
    },
  });

  const openEditModal = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });
  };

  const onEditSubmit = (data: EditUserForm) => {
    if (editingUser) updateMutation.mutate({ id: editingUser.id, data });
  };

  const columns: Column<User>[] = [
    ...baseColumns,
    ...(canEdit
      ? [
          {
            key: "actions",
            header: "",
            sortable: false,
            render: (u) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => openEditModal(u)}
                  aria-label={`Editar ${u.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          } as Column<User>,
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Usuarios</h2>
        <p className="page-description">Gestión global de cuentas y roles del sistema.</p>
      </div>

      <DataTable
        data={records}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar usuario..."
        emptyTitle="Sin usuarios"
        emptyDescription="No hay usuarios registrados."
        headerAction={
          canEdit ? (
            <TableHeaderButton label="Nuevo usuario" icon={<Plus />} onClick={openModal} />
          ) : undefined
        }
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Introduce los datos del nuevo usuario. La contraseña será necesaria para el primer acceso.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-user-name">Nombre</Label>
                <Input
                  id="new-user-name"
                  placeholder="Nombre completo"
                  autoComplete="name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-user-password">Contraseña</Label>
                <Input
                  id="new-user-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select
                  value={watch("role")}
                  onValueChange={(value) => setValue("role", value as ClinicAssignableRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLINIC_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="new-user-active">Usuario activo</Label>
                <p className="text-xs text-muted-foreground">
                  Si está desactivado, no podrá iniciar sesión.
                </p>
              </div>
              <Switch
                id="new-user-active"
                checked={isActive}
                onCheckedChange={(checked) => setValue("is_active", checked)}
              />
            </div>
            <FormDialogFooter
              submitLabel={createMutation.isPending ? "Creando…" : "Crear usuario"}
              isPending={isSubmitting || createMutation.isPending}
              onCancel={() => setModalOpen(false)}
            />
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario. La contraseña solo puede ser cambiada por el propio usuario.
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-user-name">Nombre</Label>
                  <Input
                    id="edit-user-name"
                    placeholder="Nombre completo"
                    autoComplete="name"
                    {...editForm.register("name")}
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-xs text-destructive">{editForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-user-email">Email</Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    autoComplete="email"
                    {...editForm.register("email")}
                  />
                  {editForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{editForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Rol</Label>
                  <Select
                    value={editForm.watch("role")}
                    onValueChange={(value) => editForm.setValue("role", value as ClinicAssignableRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLINIC_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-user-active">Usuario activo</Label>
                  <p className="text-xs text-muted-foreground">
                    Si está desactivado, no podrá iniciar sesión.
                  </p>
                </div>
                <Switch
                  id="edit-user-active"
                  checked={editForm.watch("is_active")}
                  onCheckedChange={(checked) => editForm.setValue("is_active", checked)}
                />
              </div>
              <FormDialogFooter
                submitLabel={updateMutation.isPending ? "Guardando…" : "Guardar"}
                isPending={editForm.formState.isSubmitting || updateMutation.isPending}
                onCancel={() => setEditingUser(null)}
              />
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
