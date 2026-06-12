import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/app/providers/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { SelectableEntityCard } from "./SelectableEntityCard";
import { LoginShell } from "./LoginShell";
import { fetchVisibleClinics, fetchStaff } from "@/features/auth/api";
import {
  isPinFallbackToClassicError,
  isPinLockedError,
  parseApiError,
} from "@/lib/apiError";
import type { AuthClinicSummary, AuthStaffMember, LoginWizardStep } from "@/types/auth";
import { requestClinicRecovery, requestUserRecovery } from "@/features/auth/api";
import { authStaffQueryKey, AUTH_STAFF_QUERY_ROOT } from "@/features/auth/queryKeys";
import { toast } from "sonner";

const clinicPasswordSchema = z.object({
  password: z.string().min(1, "Contraseña requerida"),
});

const classicLoginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().trim().min(1, "Contraseña requerida").max(128),
});

const recoveryEmailSchema = z.object({
  email: z.string().trim().email("Email inválido"),
});

type ClinicPasswordForm = z.infer<typeof clinicPasswordSchema>;
type ClassicLoginForm = z.infer<typeof classicLoginSchema>;

function resolveInitialStep(
  isAuthenticated: boolean,
  hasClinicSession: boolean,
): LoginWizardStep | null {
  if (isAuthenticated) return null;
  if (hasClinicSession) return "staff";
  return "clinics";
}

export function LoginFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    isAuthenticated,
    hasClinicSession,
    clinicId,
    clinicName,
    loginClinic,
    loginPin,
    login,
    logoutClinic,
  } = useAuth();

  const [step, setStep] = useState<LoginWizardStep>("clinics");
  const [selectedClinic, setSelectedClinic] = useState<AuthClinicSummary | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<AuthStaffMember | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [showClinicRecovery, setShowClinicRecovery] = useState(false);
  const [showUserRecovery, setShowUserRecovery] = useState(false);

  useEffect(() => {
    const initial = resolveInitialStep(isAuthenticated, hasClinicSession);
    if (initial === null) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setStep(initial);
  }, [isAuthenticated, hasClinicSession, navigate]);

  const {
    data: clinics = [],
    isLoading: clinicsLoading,
    isError: clinicsError,
  } = useQuery({
    queryKey: ["auth", "clinics"],
    queryFn: fetchVisibleClinics,
    enabled: step === "clinics",
  });

  const {
    data: staff = [],
    isLoading: staffLoading,
    isError: staffError,
  } = useQuery({
    queryKey: authStaffQueryKey(clinicId),
    queryFn: fetchStaff,
    enabled: step === "staff" && hasClinicSession && !!clinicId,
    staleTime: 0,
    gcTime: 0,
  });

  const clinicPasswordForm = useForm<ClinicPasswordForm>({
    resolver: zodResolver(clinicPasswordSchema),
  });

  const classicForm = useForm<ClassicLoginForm>({
    resolver: zodResolver(classicLoginSchema),
  });

  const recoveryForm = useForm<{ email: string }>({
    resolver: zodResolver(recoveryEmailSchema),
  });

  const goToClinics = async () => {
    setError(null);
    setSelectedClinic(null);
    setSelectedStaff(null);
    setPin("");
    queryClient.removeQueries({ queryKey: AUTH_STAFF_QUERY_ROOT });
    if (hasClinicSession) await logoutClinic();
    setStep("clinics");
  };

  const onClinicPasswordSubmit = async (data: ClinicPasswordForm) => {
    if (!selectedClinic) return;
    setError(null);
    try {
      const clinicIdForLogin = selectedClinic.id;
      queryClient.removeQueries({ queryKey: AUTH_STAFF_QUERY_ROOT });
      await loginClinic(clinicIdForLogin, data.password);
      await queryClient.fetchQuery({
        queryKey: authStaffQueryKey(clinicIdForLogin),
        queryFn: fetchStaff,
      });
      setStep("staff");
    } catch (err: unknown) {
      const { status, detail } = parseApiError(err);
      if (status === 401) {
        setError("Contraseña incorrecta");
        return;
      }
      setError(detail ?? "No se pudo validar la clínica");
    }
  };

  const onPinSubmit = async (value: string) => {
    if (!selectedStaff || value.length !== 4) return;
    setError(null);
    setPinSubmitting(true);
    try {
      await loginPin(selectedStaff.id, value, { name: selectedStaff.name, email: "" });
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (isPinLockedError(err)) {
        setStep("locked");
        setError(null);
        return;
      }
      if (isPinFallbackToClassicError(err)) {
        setStep("classic");
        setError("Demasiados intentos. Usa tu email y contraseña.");
        return;
      }
      const { status } = parseApiError(err);
      if (status === 401) {
        setError("PIN incorrecto. Inténtalo de nuevo.");
        setPin("");
        return;
      }
      setError(parseApiError(err).detail ?? "Error al validar el PIN");
      setPin("");
    } finally {
      setPinSubmitting(false);
    }
  };

  const onClassicSubmit = async (data: ClassicLoginForm) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      if (isPinLockedError(err)) {
        setStep("locked");
        return;
      }
      const { status, detail } = parseApiError(err);
      if (status === 401) {
        setError("Credenciales inválidas");
        return;
      }
      setError(detail ?? "Ocurrió un error al iniciar sesión");
    }
  };

  const onRecoverySubmit = async (data: { email: string }, type: "clinic" | "user") => {
    try {
      if (type === "clinic") await requestClinicRecovery(data.email);
      else await requestUserRecovery(data.email);
      toast.success("Solicitud enviada", {
        description: "Si el email existe, recibirás un enlace en breve.",
      });
      setShowClinicRecovery(false);
      setShowUserRecovery(false);
      recoveryForm.reset();
    } catch {
      toast.success("Solicitud enviada", {
        description: "Si el email existe, recibirás un enlace en breve.",
      });
    }
  };

  const stepSubtitle: Record<LoginWizardStep, string> = {
    clinics: "Selecciona tu clínica",
    "clinic-password": selectedClinic?.name ?? "Contraseña de clínica",
    staff: clinicName ?? "Selecciona tu usuario",
    pin: selectedStaff?.name ?? "Introduce tu PIN",
    classic: "Acceso con email y contraseña",
    locked: "Cuenta bloqueada",
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <LoginShell subtitle={stepSubtitle[step]}>
      {error && step !== "locked" && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {step === "clinics" && (
        <div className="space-y-4">
          {clinicsLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {clinicsError && (
            <p className="text-sm text-destructive text-center">No se pudieron cargar las clínicas</p>
          )}
          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto">
            {clinics.map((clinic) => (
              <SelectableEntityCard
                key={clinic.id}
                layout="row"
                name={clinic.name}
                imageUrl={clinic.image_url}
                displayInitial={clinic.display_initial}
                onClick={async () => {
                  setError(null);
                  setSelectedStaff(null);
                  setPin("");
                  queryClient.removeQueries({ queryKey: AUTH_STAFF_QUERY_ROOT });
                  if (hasClinicSession) await logoutClinic();
                  setSelectedClinic(clinic);
                  setStep("clinic-password");
                  clinicPasswordForm.reset();
                }}
              />
            ))}
          </div>
          <div className="pt-2 border-t">
            <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setStep("classic")}>
              Acceso con email (administración)
            </Button>
          </div>
        </div>
      )}

      {step === "clinic-password" && selectedClinic && (
        <div className="space-y-4">
          <Button type="button" variant="ghost" size="sm" className="-ml-2" onClick={goToClinics}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Cambiar clínica
          </Button>
          {showClinicRecovery ? (
            <form
              onSubmit={recoveryForm.handleSubmit((d) => onRecoverySubmit(d, "clinic"))}
              className="space-y-3"
            >
              <Label className="text-xs">Email de administrador</Label>
              <Input type="email" {...recoveryForm.register("email")} className="h-10" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowClinicRecovery(false)}>
                  Volver
                </Button>
                <Button type="submit" className="flex-1">
                  Enviar enlace
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={clinicPasswordForm.handleSubmit(onClinicPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-password" className="text-xs font-medium">
                  Contraseña de clínica
                </Label>
                <Input
                  id="clinic-password"
                  type="password"
                  autoComplete="current-password"
                  className="h-10"
                  {...clinicPasswordForm.register("password")}
                />
                {clinicPasswordForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {clinicPasswordForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-10"
                disabled={clinicPasswordForm.formState.isSubmitting}
              >
                {clinicPasswordForm.formState.isSubmitting ? "Validando..." : "Continuar"}
              </Button>
              <button
                type="button"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowClinicRecovery(true)}
              >
                ¿Olvidaste la contraseña de la clínica?
              </button>
            </form>
          )}
        </div>
      )}

      {step === "staff" && (
        <div className="space-y-4">
          <Button type="button" variant="ghost" size="sm" className="-ml-2" onClick={goToClinics}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Cambiar clínica
          </Button>
          {staffLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {staffError && (
            <p className="text-sm text-destructive text-center">No se pudo cargar el personal</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto">
            {staff.map((member) => (
              <SelectableEntityCard
                key={member.id}
                name={member.name}
                subtitle={member.role}
                imageUrl={member.image_url}
                displayInitial={member.display_initial}
                onClick={() => {
                  setSelectedStaff(member);
                  setPin("");
                  setError(null);
                  setStep("pin");
                }}
              />
            ))}
          </div>
          <Button type="button" variant="ghost" className="w-full text-xs" onClick={() => setStep("classic")}>
            Usar email y contraseña
          </Button>
        </div>
      )}

      {step === "pin" && selectedStaff && (
        <div className="space-y-4 flex flex-col items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start -ml-2"
            onClick={() => {
              setStep("staff");
              setPin("");
              setError(null);
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Cambiar usuario
          </Button>
          <div className="flex flex-col items-center gap-1">
            <SelectableEntityCard
              name={selectedStaff.name}
              subtitle={selectedStaff.role}
              imageUrl={selectedStaff.image_url}
              displayInitial={selectedStaff.display_initial}
              selected
              onClick={() => setStep("staff")}
            />
            <span className="text-[10px] text-muted-foreground">Toca para cambiar usuario</span>
          </div>
          <InputOTP maxLength={4} value={pin} onChange={setPin} disabled={pinSubmitting}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-[11px] text-muted-foreground">PIN de 4 dígitos</p>
          <Button
            type="button"
            className="w-full h-10"
            disabled={pin.length !== 4 || pinSubmitting}
            onClick={() => void onPinSubmit(pin)}
          >
            {pinSubmitting ? "Validando..." : "Acceder"}
          </Button>
          <Button type="button" variant="link" className="text-xs" onClick={() => setStep("classic")}>
            Acceder con email y contraseña
          </Button>
        </div>
      )}

      {step === "classic" && (
        <div className="space-y-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => {
              setError(null);
              if (hasClinicSession && selectedStaff) setStep("pin");
              else if (hasClinicSession) setStep("staff");
              else setStep("clinics");
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          {showUserRecovery ? (
            <form
              onSubmit={recoveryForm.handleSubmit((d) => onRecoverySubmit(d, "user"))}
              className="space-y-3"
            >
              <Label className="text-xs">Tu email</Label>
              <Input type="email" {...recoveryForm.register("email")} className="h-10" />
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowUserRecovery(false)}>
                  Volver
                </Button>
                <Button type="submit" className="flex-1">
                  Enviar enlace
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={classicForm.handleSubmit(onClassicSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="h-10"
                  {...classicForm.register("email")}
                />
                {classicForm.formState.errors.email && (
                  <p className="text-xs text-destructive">{classicForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="h-10"
                  {...classicForm.register("password")}
                />
                {classicForm.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {classicForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full h-10"
                disabled={classicForm.formState.isSubmitting}
              >
                {classicForm.formState.isSubmitting ? "Ingresando..." : "Iniciar sesión"}
              </Button>
              <button
                type="button"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setShowUserRecovery(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}
        </div>
      )}

      {step === "locked" && (
        <div className="text-center space-y-4 py-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-sm font-medium">Contacta con el administrador</p>
          <p className="text-xs text-muted-foreground">
            Tu cuenta está bloqueada por demasiados intentos fallidos.
          </p>
          <Button type="button" variant="outline" onClick={goToClinics}>
            Volver al inicio
          </Button>
        </div>
      )}
    </LoginShell>
  );
}
