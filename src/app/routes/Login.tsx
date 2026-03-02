import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/app/providers/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().trim().min(1, "Contraseña requerida").max(128),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg || "Credenciales inválidas");
    }
  };

  // Demo: allow quick access with mock auth
  const handleDemoLogin = () => {
    // Set demo user in localStorage directly
    const demoUser = {
      id: "demo-001",
      clinic_id: "clinic-001",
      name: "Admin Demo",
      email: "admin@demo.com",
      role: "ADMIN" as const,
      is_active: true,
    };
    localStorage.setItem("auth_token", "demo-token");
    localStorage.setItem("clinic_id", "clinic-001");
    localStorage.setItem("auth_user", JSON.stringify(demoUser));
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">LockerHub</h1>
          <p className="text-sm text-muted-foreground mt-1">Acceso al sistema</p>
        </div>

        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@empresa.com"
                className="h-10"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-10"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-10" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full text-xs" onClick={handleDemoLogin}>
              Acceso demo (Admin)
            </Button>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Sistema interno · Acceso restringido
        </p>
      </div>
    </div>
  );
}
