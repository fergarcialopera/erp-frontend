import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    // TODO: conectar con el endpoint real de contacto cuando esté disponible
    setTimeout(() => {
      setSubmitting(false);
      onOpenChange(false);
      toast.success("Solicitud enviada", {
        description: "Gracias por tu interés. Te contactaremos muy pronto.",
      });
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="rounded-2xl sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-bold tracking-tight">
            Consigue una prueba
          </DialogTitle>
          <DialogDescription>
            Cuéntanos sobre tu clínica y te prepararemos una demostración personalizada.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-1 grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="contact-name">Nombre*</Label>
            <Input id="contact-name" name="name" required placeholder="Tu nombre" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-company">Empresa o clínica*</Label>
            <Input id="contact-company" name="company" required placeholder="Nombre del centro" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="contact-email">Email*</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                required
                placeholder="tu@empresa.com"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contact-phone">Teléfono</Label>
              <Input id="contact-phone" name="phone" type="tel" placeholder="600 000 000" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="contact-message">¿Qué necesitas controlar?</Label>
            <Textarea
              id="contact-message"
              name="message"
              rows={3}
              placeholder="Cuéntanos brevemente tu caso…"
            />
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="mt-1 w-full">
            {submitting ? "Enviando…" : "Solicitar la prueba"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Sin compromiso. Te responderemos en menos de 24&nbsp;h laborables.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
