'use client';

import { ReactNode } from 'react';
import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';
import type { NavSection } from './nav-types';

type AdminLayoutProps<TRoute extends string> = {
    activeRoute: TRoute;
    children: ReactNode;
    navSections: NavSection<TRoute>[];
    searchValue: string;
    tenantSelector: ReactNode;
    userEmail: string;
    userName: string;
    onRouteChange: (route: TRoute) => void;
    onSearchChange: (value: string) => void;
};

export function AdminLayout<TRoute extends string>({
    activeRoute,
    children,
    navSections,
    searchValue,
    tenantSelector,
    userEmail,
    userName,
    onRouteChange,
    onSearchChange,
}: AdminLayoutProps<TRoute>) {
    return (
        <div className="flex h-dvh min-w-0 bg-background">
            <AdminSidebar
                activeRoute={activeRoute}
                sections={navSections}
                onRouteChange={onRouteChange}
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <AdminHeader
                    searchValue={searchValue}
                    tenantSelector={tenantSelector}
                    userEmail={userEmail}
                    userName={userName}
                    onSearchChange={onSearchChange}
                />
                <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
}
