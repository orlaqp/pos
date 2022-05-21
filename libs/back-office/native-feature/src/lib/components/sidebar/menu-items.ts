import { Role } from '@pos/auth/data-access';
import { SidebarItem } from './definitions';

export const menuItems: SidebarItem[] = [
    {
        id: '1',
        title: 'Dashboard',
        icon: 'view-dashboard-outline',
        role: Role.Admin,
    },
    // {
    //     id: '2',
    //     title: 'Customers',
    //     icon: 'account-box-multiple-outline',
    //     role: Role.Admin,
    // },
    // {
    //     id: '3',
    //     title: 'Reports',
    //     icon: 'clipboard-list-outline',
    //     children: [],
    //     role: Role.Admin,
    // },
    {
        id: '4',
        title: 'Inventory',
        icon: 'warehouse',
        children: [
            { id: '4-1', title: 'Receive' },
            { id: '4-2', title: 'Count' },
        ],
        role: Role.Admin,
    },
    {
        id: '5',
        title: 'Products',
        icon: 'qrcode',
        role: Role.Admin,
        children: [
            { id: '5-1', title: 'Products' },
            { id: '5-2', title: 'Categories' },
            { id: '5-3', title: 'U/M' },
            { id: '5-4', title: 'Brands' },
        ],
    },
    // {
    //     id: '6',
    //     title: 'Users',
    //     icon: 'account-group-outline',
    //     role: Role.Admin,
    //     children: [
    //         { id: '6-1', title: 'Users' },
    //         { id: '6-2', title: 'Roles' },
    //     ],
    // },
    {
        id: '7',
        title: 'Settings',
        icon: 'cog-outline',
        role: Role.Admin,
        children: [
            { id: '7-1', title: 'Store' },
            { id: '7-2', title: 'Printers' },
            { id: '7-3', title: 'Receipt' },
            { id: '7-4', title: 'General' },
        ],
    },
];
