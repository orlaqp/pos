export interface SidebarItem {
    id: string;
    title: string;
    component?: string;
    icon?: string;
    role?: string;
    params?: any;
    children?: SidebarItem[];
}