import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.78rem] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-border bg-muted text-muted-foreground",
        success:
          "border-[hsla(167,90%,48%,0.24)] bg-[hsla(167,90%,48%,0.12)] text-[hsl(var(--ll-turquoise-600))]",
        warning:
          "border-[hsla(36,100%,65%,0.35)] bg-[hsla(36,100%,65%,0.14)] text-[hsl(var(--ll-warning-700))]",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-border bg-background text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
