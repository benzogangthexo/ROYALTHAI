import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-3 [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-ink hover:bg-[color-mix(in_oklab,var(--brand)_86%,white)]",
        outline: "border border-line-strong text-fg hover:border-fg hover:bg-[color-mix(in_oklab,var(--fg)_6%,transparent)]",
        ghost: "text-fg hover:bg-[color-mix(in_oklab,var(--fg)_8%,transparent)]",
        paper: "bg-paper text-paper-ink hover:bg-[color-mix(in_oklab,var(--paper)_88%,black)]",
      },
      size: {
        sm: "h-11 px-4 text-sm rounded-[var(--radius-pill)]",
        md: "h-12 px-6 text-[0.95rem] rounded-[var(--radius-pill)]",
        lg: "h-14 px-8 text-base rounded-[var(--radius-pill)]",
        icon: "size-12 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

/** shadcn/ui Button под бренд. asChild: стили на ссылку (<a>, Link) */
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
