'use client';

import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../ui/utils';
import type { NavSection } from './nav-types';

type AdminSidebarProps<TRoute extends string> = {
    activeRoute: TRoute;
    sections: NavSection<TRoute>[];
    onRouteChange: (route: TRoute) => void;
};

export function AdminSidebar<TRoute extends string>({
    activeRoute,
    sections,
    onRouteChange,
}: AdminSidebarProps<TRoute>) {
    const [openGroups, setOpenGroups] = useState<string[]>(['Reports', 'Catalog']);

    const toggleGroup = (title: string) => {
        setOpenGroups((current) =>
            current.includes(title)
                ? current.filter((item) => item !== title)
                : [...current, title]
        );
    };

    return (
        <aside className="flex h-dvh w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
            <ScrollArea className="min-h-0 flex-1">
                <div className="px-3 py-4">
                {sections.map((section) => (
                    <div key={section.title} className="mb-6">
                        <h2 className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground">
                            {section.title}
                        </h2>
                        <div className="flex flex-col gap-1">
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const isOpen = openGroups.includes(item.title);
                                const isActive = activeRoute === item.id;

                                if (item.children?.length) {
                                    return (
                                        <Collapsible key={item.id} open={isOpen} onOpenChange={() => toggleGroup(item.title)}>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" className="h-auto w-full min-w-0 justify-start px-3 py-2.5 text-sidebar-foreground">
                                                    <Icon className="shrink-0" />
                                                    <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
                                                    <ChevronRight className={cn('shrink-0 transition-transform', isOpen && 'rotate-90')} />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-sidebar-border pl-2">
                                                {item.children.map((child) => {
                                                    const ChildIcon = child.icon;
                                                    const childActive = activeRoute === child.id;
                                                    return (
                                                        <Button key={child.id} variant="ghost" onClick={() => onRouteChange(child.id)} className={cn('h-auto w-full min-w-0 justify-start px-3 py-2 text-sidebar-foreground', childActive && 'bg-sidebar-accent text-sidebar-accent-foreground')}>
                                                            <ChildIcon className="shrink-0" />
                                                            <span className="flex-1 truncate text-left">{child.title}</span>
                                                            <ChevronRight className="shrink-0 opacity-50" />
                                                        </Button>
                                                    );
                                                })}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                }

                                return (
                                    <Button key={item.id} variant="ghost" onClick={() => onRouteChange(item.id)} className={cn('h-auto w-full min-w-0 justify-start px-3 py-2.5 text-sidebar-foreground', isActive && 'bg-sidebar-primary text-sidebar-primary-foreground')}>
                                        <Icon className="shrink-0" />
                                        <span className="min-w-0 flex-1 truncate text-left">{item.title}</span>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </aside>
    );
}
