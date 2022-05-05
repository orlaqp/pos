export interface SidebarItem {
    id: string;
    title: string;
    icon?: string;
    children?: SidebarItem[];
}