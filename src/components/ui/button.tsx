import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold leading-none ring-offset-background transition-all duration-[180ms] ease-out focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:transform-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:-translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_24px_hsla(167,90%,48%,0.2)] hover:bg-[hsl(var(--ll-turquoise-600))] hover:shadow-[0_16px_32px_hsla(167,90%,48%,0.26)] disabled:bg-[hsl(var(--ll-turquoise-100))] disabled:text-[hsl(var(--ll-turquoise-disabled))] disabled:shadow-none",
        secondary:
          "border border-border bg-card text-secondary hover:bg-background hover:border-[hsl(var(--ll-text-muted-on-dark))] disabled:bg-muted disabled:text-[hsl(var(--ll-text-muted-on-dark))] disabled:border-border",
        onDark:
          "border border-white bg-card text-secondary hover:bg-background hover:border-background disabled:opacity-50",
        ghostDark:
          "border border-[hsla(216,26%,78%,0.35)] bg-transparent text-[hsl(var(--ll-text-on-dark))] hover:bg-white/5 hover:text-white hover:border-primary disabled:opacity-50",
        destructive:
          "rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50",
        outline:
          "rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
        ghost: "rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
        link: "rounded-md text-primary underline-offset-4 hover:underline disabled:opacity-50",
      },
      size: {
        default: "h-11 min-h-[46px] px-5",
        sm: "h-9 min-h-9 px-4 text-xs",
        lg: "h-12 min-h-12 px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
