import { SidebarItem } from './definitions';

export const menuItems: SidebarItem[] = [
    {
        id: '1',
        title: 'Dashboard',
        icon: 'view-dashboard-outline',
    },
    {
        id: '2',
        title: 'Customers',
        icon: 'account-box-multiple-outline',
    },
    {
        id: '3',
        title: 'Reports',
        icon: 'clipboard-list-outline',
        children: [],
    },
    {
        id: '4',
        title: 'Inventory',
        icon: 'warehouse',
        children: [
            {
                id: '4-1',
                title: 'Receive',
            },
            {
                id: '4-2',
                title: 'Count',
            },
        ],
    },
    {
        id: '5',
        title: 'Products',
        icon: 'qrcode',
        children: [
            { id: '5-1', title: 'Categories' },
            { id: '5-2', title: 'Products' },
            { id: '5-3', title: 'U/M' },
        ],
    },
    {
        id: '6',
        title: 'Users',
        icon: 'account-group-outline',
        children: [
            { id: '6-1', title: 'Users' },
            { id: '6-2', title: 'Roles' },
        ],
    },
    {
        id: '7',
        title: 'Settings',
        icon: 'cog-outline',
        children: [
            { id: '7-1', title: 'Store Info' },
            { id: '7-2', title: 'Printers' },
            { id: '7-3', title: 'Receipt' },
        ],
    },
];
