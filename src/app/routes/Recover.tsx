import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { confirmRecovery, type RecoveryConfirmType } from "@/features/auth/api";
import { parseApiError } from "@/lib/apiError";

const passwordSchema = z
  .object({
    password: z.string().min(6, "Mínimo 6 caracteres").max(128),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

const pinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "PIN de 4 dígitos"),
});

type PasswordForm = z.infer<typeof passwordSchema>;

const VALID_TYPES: RecoveryConfirmType[] = ["clinic_password", "user_password", "user_pin"];

function isValidType(value: string | null): value is RecoveryConfirmType {
  return value != null && VALID_TYPES.includes(value as RecoveryConfirmType);
}

export default function RecoverPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const typeParam = params.get("type");
  const type = isValidType(typeParam) ? typeParam : null;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pin, setPin] = useState("");

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  if (!token || !type) {
    return (
      <RecoverShell>
        <p className="text-sm text-destructive text-center">
          Enlace no válido. Solicita uno nuevo desde la pantalla de acceso.
        </p>
        <Button asChild className="w-full mt-4">
          <Link to="/login">Ir al acceso</Link>
        </Button>
      </RecoverShell>
    );
  }

  if (success) {
    return (
      <RecoverShell subtitle="Listo">
        <div className="flex flex-col items-center gap-3 text-center py-2">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <p className="text-sm">Credencial actualizada correctamente.</p>
          <Button asChild className="w-full">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </RecoverShell>
    );
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setError(null);
    try {
      await confirmRecovery(token, type, { password: data.password });
      setSuccess(true);
    } catch (err: unknown) {
      setError(parseApiError(err).detail ?? "No se pudo completar la recuperación");
    }
  };

  const onPinSubmit = async () => {
    const parsed = pinSchema.safeParse({ pin });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "PIN inválido");
      return;
    }
    setError(null);
    try {
      await confirmRecovery(token, type, { pin: parsed.data.pin });
      setSuccess(true);
    } catch (err: unknown) {
      setError(parseApiError(err).detail ?? "No se pudo actualizar el PIN");
    }
  };

  const title =
    type === "user_pin"
      ? "Nuevo PIN"
      : type === "clinic_password"
        ? "Nueva contraseña de clínica"
        : "Nueva contraseña";

  return (
    <RecoverShell subtitle={title}>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {type === "user_pin" ? (
        <div className="space-y-4 flex flex-col items-center">
          <InputOTP maxLength={4} value={pin} onChange={setPin}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          <Button type="button" className="w-full" onClick={onPinSubmit} disabled={pin.length !== 4}>
            Guardar PIN
          </Button>
        </div>
      ) : (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs">
              Nueva contraseña
            </Label>
            <Input id="password" type="password" className="h-10" {...passwordForm.register("password")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-xs">
              Confirmar
            </Label>
            <Input id="confirm" type="password" className="h-10" {...passwordForm.register("confirm")} />
            {passwordForm.formState.errors.confirm && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.confirm.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-10" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </form>
      )}
    </RecoverShell>
  );
}

function RecoverShell({
  subtitle = "Recuperación",
  children,
}: {
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold">LogiLock</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <div className="bg-card rounded-lg border p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
