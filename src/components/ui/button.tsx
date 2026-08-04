import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-[opacity,transform,background-color,border-color,color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-smooth)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/50 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-cyan text-bg hover:bg-cyan-glow shadow-[0_0_20px_color-mix(in_oklab,var(--color-cyan)_25%,transparent)]",
        secondary:
          "bg-bg-subtle text-fg border border-border hover:border-border-strong hover:bg-bg-elevated",
        ghost: "bg-transparent text-fg-muted hover:text-fg hover:bg-bg-subtle",
        amber:
          "bg-amber text-bg hover:brightness-110 shadow-[0_0_18px_color-mix(in_oklab,var(--color-amber)_28%,transparent)]",
        outline:
          "border border-cyan/40 text-cyan bg-transparent hover:bg-cyan/10",
        danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-[var(--radius-sm)] px-3 text-xs",
        lg: "h-12 rounded-[var(--radius-lg)] px-6 text-base",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
