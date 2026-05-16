export type SidebarGroup = 'Core' | 'Management' | 'Configuration';

export interface SidebarItem {
    id: string;
    title: string;
    labelKey?: string;
    component?: string;
    icon?: string;
    role?: string;
    params?: any;
    group?: SidebarGroup;
    children?: SidebarItem[];
}
