import * as React from "react";
import { cn } from "cn";
function Card({ className, ...props }) {
    return (<div data-slot="card" className={cn("mf:flex mf:flex-col mf:gap-6 mf:rounded-xl mf:border mf:bg-card mf:py-6 mf:text-card-foreground mf:shadow-sm", className)} {...props}/>);
}
function CardHeader({ className, ...props }) {
    return (<div data-slot="card-header" className={cn("mf:@container/card-header mf:grid mf:auto-rows-min mf:grid-rows-[auto_auto] mf:items-start mf:gap-2 mf:px-6 mf:has-data-[slot=card-action]:grid-cols-[1fr_auto] mf:[.border-b]:pb-6", className)} {...props}/>);
}
function CardTitle({ className, ...props }) {
    return (<div data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props}/>);
}
function CardDescription({ className, ...props }) {
    return (<div data-slot="card-description" className={cn("mf:text-sm mf:text-muted-foreground", className)} {...props}/>);
}
function CardAction({ className, ...props }) {
    return (<div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props}/>);
}
function CardContent({ className, ...props }) {
    return (<div data-slot="card-content" className={cn("mf:px-6", className)} {...props}/>);
}
function CardFooter({ className, ...props }) {
    return (<div data-slot="card-footer" className={cn("mf:flex mf:items-center mf:px-6 mf:[.border-t]:pt-6", className)} {...props}/>);
}
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, };
