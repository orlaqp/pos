'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import { cn } from './utils';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export const SelectTrigger = forwardRef<
    ElementRef<typeof SelectPrimitive.Trigger>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            'flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:min-w-0 [&>span]:truncate',
            className
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronDown className="shrink-0" />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectContent = forwardRef<
    ElementRef<typeof SelectPrimitive.Content>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', style, ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                'z-50 max-h-[var(--radix-select-content-available-height)] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
                position === 'popper' && 'translate-y-1',
                className
            )}
            position={position}
            style={{
                ...style,
                width: 'var(--radix-select-trigger-width)',
            }}
            {...props}
        >
            <SelectPrimitive.Viewport className="w-full p-1">
                {children}
            </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectItem = forwardRef<
    ElementRef<typeof SelectPrimitive.Item>,
    ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { checked?: boolean }
>(({ checked = false, className, children, style, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            'w-full cursor-default select-none rounded-sm px-3 py-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            className
        )}
        style={{
            ...style,
            alignItems: 'center',
            display: 'flex',
            minHeight: '2.75rem',
            position: 'relative',
        }}
        {...props}
    >
        <span
            aria-hidden="true"
            style={{
                alignItems: 'center',
                display: 'flex',
                height: '1rem',
                justifyContent: 'center',
                left: '0.75rem',
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1rem',
            }}
        >
            {checked ? <Check style={{ height: '1rem', width: '1rem' }} /> : null}
        </span>
        <span
            style={{
                display: 'block',
                minWidth: 0,
                overflow: 'hidden',
                paddingLeft: '1.75rem',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
            }}
        >
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </span>
    </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
