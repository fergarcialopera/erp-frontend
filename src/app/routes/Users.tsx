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
import { useAuth } from "@/app/providers/useAuth";
import { useUsers } from "@/features/users/queries";
import { createUser } from "@/features/users/api";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { User, Role } from "@/types/models";

const roleStyles: Record<string, string> = {
  ADMIN: "bg-accent/15 text-accent border-accent/25",
  RESPONSABLE: "bg-soft/30 text-soft-foreground border-soft/40",
  READONLY: "bg-muted text-muted-foreground border-border",
};

const columns: Column<User>[] = [
  { key: "name", header: "Nombre", sortable: true },
  {
    key: "email",
    header: "Email",
    render: (u) => <span className="text-muted-foreground">{u.email}</span>,
  },
  {
    key: "role",
    header: "Rol",
    render: (u) => (
      <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium border ${roleStyles[u.role]}`}
      >
        {u.role}
      </span>
    ),
  },
  {
    key: "is_active",
    header: "Estado",
    render: (u) => <StatusBadge status={u.is_active ? "Activo" : "Inactivo"} type="active" />,
  },
];

const newUserSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
  email: z.string().trim().email("Email no válido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(128),
  role: z.enum(["ADMIN", "RESPONSABLE", "READONLY"] as const),
  is_active: z.boolean(),
});

type NewUserForm = z.infer<typeof newUserSchema>;

const ROLES: Role[] = ["ADMIN", "RESPONSABLE", "READONLY"];

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { clinicId } = useAuth();
  const { data: records, isLoading, isError, refetch } = useUsers(clinicId);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<NewUserForm>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { role: "READONLY", is_active: true },
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
      reset({ name: "", email: "", password: "", role: "READONLY", is_active: true });
      setModalOpen(false);
    },
  });

  const onSubmit = (data: NewUserForm) => {
    createMutation.mutate(data);
  };

  const openModal = () => {
    reset({ name: "", email: "", password: "", role: "READONLY", is_active: true });
    setModalOpen(true);
  };

  const isActive = watch("is_active");

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h2 className="page-title">Usuarios</h2>
        <p className="page-description">Gestión de usuarios del sistema</p>
      </div>

      <DataTable
        data={records || []}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Buscar usuario..."
        emptyTitle="Sin usuarios"
        emptyDescription="No hay usuarios registrados."
        headerAction={
          <Button size="sm" className="h-9 gap-1.5" onClick={openModal} aria-label="Nuevo usuario">
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Introduce los datos del nuevo usuario. La contraseña será necesaria para el primer acceso.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                onValueChange={(value) => setValue("role", value as Role)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                {createMutation.isPending ? "Creando…" : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
