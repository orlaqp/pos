import type { ComponentType } from 'react';

export type NavItem<TRoute extends string> = {
    id: TRoute;
    title: string;
    icon: ComponentType<{ className?: string }>;
    children?: NavItem<TRoute>[];
};

export type NavSection<TRoute extends string> = {
    title: string;
    items: NavItem<TRoute>[];
};
