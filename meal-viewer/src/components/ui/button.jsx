import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "cn";
import { Slot } from "@radix-ui/react-slot";
const buttonVariants = cva("mf:inline-flex mf:shrink-0 mf:items-center mf:justify-center mf:gap-2 mf:rounded-md mf:text-sm mf:font-medium mf:whitespace-nowrap mf:transition-all mf:outline-none mf:focus-visible:border-ring mf:focus-visible:ring-[3px] mf:focus-visible:ring-ring/50 mf:disabled:pointer-events-none mf:disabled:opacity-50 mf:aria-invalid:border-destructive mf:aria-invalid:ring-destructive/20 mf:dark:aria-invalid:ring-destructive/40 mf:[&_svg]:pointer-events-none mf:[&_svg]:shrink-0 mf:[&_svg:not([class*='size-'])]:size-4", {
    variants: {
        variant: {
            default: "mf:bg-primary mf:text-primary-foreground mf:hover:bg-primary/90",
            destructive: "mf:bg-destructive mf:text-white mf:hover:bg-destructive/90 mf:focus-visible:ring-destructive/20 mf:dark:bg-destructive/60 mf:dark:focus-visible:ring-destructive/40",
            outline: "mf:border mf:bg-background mf:shadow-xs mf:hover:bg-accent mf:hover:text-accent-foreground mf:dark:border-input mf:dark:bg-input/30 mf:dark:hover:bg-input/50",
            secondary: "mf:bg-secondary mf:text-secondary-foreground mf:hover:bg-secondary/80",
            ghost: "mf:hover:bg-accent mf:hover:text-accent-foreground mf:dark:hover:bg-accent/50",
            link: "mf:text-primary mf:underline-offset-4 mf:hover:underline",
        },
        size: {
            default: "mf:h-9 mf:px-4 mf:py-2 mf:has-[>svg]:px-3",
            xs: "mf:h-6 mf:gap-1 mf:rounded-md mf:px-2 mf:text-xs mf:has-[>svg]:px-1.5 mf:[&_svg:not([class*='size-'])]:size-3",
            sm: "mf:h-8 mf:gap-1.5 mf:rounded-md mf:px-3 mf:has-[>svg]:px-2.5",
            lg: "mf:h-10 mf:rounded-md mf:px-6 mf:has-[>svg]:px-4",
            icon: "mf:size-9",
            "icon-xs": "mf:size-6 mf:rounded-md mf:[&_svg:not([class*='size-'])]:size-3",
            "icon-sm": "mf:size-8",
            "icon-lg": "mf:size-10",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
    const Comp = asChild ? Slot : "button";
    return (<Comp data-slot="button" data-variant={variant} data-size={size} className={cn(buttonVariants({ variant, size }),variant!=='default'&&variant!=='destructive'&&'secondary',className)} {...props}/>);
}
export { Button, buttonVariants };
