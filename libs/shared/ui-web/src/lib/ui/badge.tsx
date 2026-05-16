import { HTMLAttributes } from 'react';
import { cn } from './utils';

const variants = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
};

export type BadgeVariant = keyof typeof variants;

export function Badge({
    className,
    variant = 'default',
    ...props
}: HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold',
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
