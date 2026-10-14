import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "@radix-ui/react-slot";
const badgeVariants = cva("mf:inline-flex mf:w-fit mf:shrink-0 mf:items-center mf:justify-center mf:gap-1 mf:overflow-hidden mf:rounded-full mf:border mf:border-transparent mf:px-2 mf:py-0.5 mf:text-xs mf:font-medium mf:whitespace-nowrap mf:transition-[color,box-shadow] mf:focus-visible:border-ring mf:focus-visible:ring-[3px] mf:focus-visible:ring-ring/50 mf:aria-invalid:border-destructive mf:aria-invalid:ring-destructive/20 mf:dark:aria-invalid:ring-destructive/40 mf:[&>svg]:pointer-events-none mf:[&>svg]:size-3", {
    variants: {
        variant: {
            default: "mf:bg-primary mf:text-primary-foreground mf:[a&]:hover:bg-primary/90",
            secondary: "mf:bg-secondary mf:text-secondary-foreground mf:[a&]:hover:bg-secondary/90",
            destructive: "mf:bg-destructive mf:text-white mf:focus-visible:ring-destructive/20 mf:dark:bg-destructive/60 mf:dark:focus-visible:ring-destructive/40 mf:[a&]:hover:bg-destructive/90",
            outline: "mf:border-border mf:text-foreground mf:[a&]:hover:bg-accent mf:[a&]:hover:text-accent-foreground",
            ghost: "mf:[a&]:hover:bg-accent mf:[a&]:hover:text-accent-foreground",
            link: "mf:text-primary mf:underline-offset-4 mf:[a&]:hover:underline",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
function Badge({ className, variant = "default", asChild = false, ...props }) {
    const Comp = asChild ? Slot : "span";
    return (<Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props}/>);
}
export { Badge, badgeVariants };
