export interface SidebarItem {
    id: string;
    title: string;
    icon?: string;
    role?: string;
    children?: SidebarItem[];
}