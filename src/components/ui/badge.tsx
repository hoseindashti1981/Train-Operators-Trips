import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
  {
    variants: {
      variant: {
        default: "border-transparent bg-muted text-foreground",
        accent: "border-transparent bg-primary text-primary-foreground",
        ok: "border-transparent bg-ok-bg text-ok",
        warn: "border-transparent bg-warn-bg text-warn",
        danger: "border-transparent bg-danger-bg text-danger",
        outline: "border-border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
