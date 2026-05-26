import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Botón compacto (solo icono) en móvil; icono + texto desde sm. */
export const tableHeaderButtonClassName =
  "h-9 w-9 shrink-0 gap-0 px-0 sm:h-9 sm:w-auto sm:gap-2 sm:px-3";

export interface TableHeaderButtonProps extends ButtonProps {
  label: string;
  icon: React.ReactNode;
}

export function TableHeaderButton({
  label,
  icon,
  className,
  "aria-label": ariaLabel,
  children,
  ...props
}: TableHeaderButtonProps) {
  return (
    <Button
      size="sm"
      className={cn(tableHeaderButtonClassName, className)}
      aria-label={ariaLabel ?? label}
      {...props}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {children}
    </Button>
  );
}

interface TableHeaderButtonLabelProps {
  label: string;
  className?: string;
}

/** Texto del botón para usar con `Button asChild` + enlace. */
export function TableHeaderButtonLabel({ label, className }: TableHeaderButtonLabelProps) {
  return <span className={cn("hidden sm:inline", className)}>{label}</span>;
}
