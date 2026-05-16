import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import { cn } from './utils';

export const Avatar = forwardRef<
    ElementRef<typeof AvatarPrimitive.Root>,
    ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn('relative flex size-10 shrink-0 overflow-hidden rounded-full', className)}
        {...props}
    />
));

export const AvatarImage = forwardRef<
    ElementRef<typeof AvatarPrimitive.Image>,
    ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image ref={ref} className={cn('aspect-square size-full', className)} {...props} />
));

export const AvatarFallback = forwardRef<
    ElementRef<typeof AvatarPrimitive.Fallback>,
    ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn('flex size-full items-center justify-center rounded-full bg-muted', className)}
        {...props}
    />
));

Avatar.displayName = AvatarPrimitive.Root.displayName;
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
