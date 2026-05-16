'use client';

import { Building2, Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { TenantSummary } from '@pos/admin/data-access';
import {
    Button,
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    Popover,
    PopoverContent,
    PopoverTrigger,
    cn,
} from '@pos/shared/ui-web';

type TenantSelectorProps = {
    selectedTenant: TenantSummary;
    tenants: TenantSummary[];
    onTenantChange: (tenant: TenantSummary) => void;
};

export function TenantSelector({ selectedTenant, tenants, onTenantChange }: TenantSelectorProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-72 min-w-0 justify-between bg-sidebar-accent/50">
                    <span className="flex min-w-0 items-center gap-2">
                        <Building2 className="shrink-0 text-sidebar-primary" />
                        <span className="flex min-w-0 flex-col items-start">
                            <span className="truncate">{selectedTenant.name}</span>
                            <span className="truncate text-xs text-muted-foreground">{selectedTenant.location}</span>
                        </span>
                    </span>
                    <ChevronsUpDown className="shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0">
                <Command>
                    <CommandInput placeholder="Search tenant..." />
                    <CommandList>
                        <CommandEmpty>No tenant found.</CommandEmpty>
                        <CommandGroup>
                            {tenants.map((tenant) => (
                                <CommandItem
                                    key={tenant.id}
                                    value={tenant.name}
                                    onSelect={() => {
                                        onTenantChange(tenant);
                                        setOpen(false);
                                    }}
                                >
                                    <Check className={cn(selectedTenant.id === tenant.id ? 'opacity-100' : 'opacity-0')} />
                                    <span className="flex flex-col">
                                        <span>{tenant.name}</span>
                                        <span className="text-xs text-muted-foreground">{tenant.location}</span>
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
