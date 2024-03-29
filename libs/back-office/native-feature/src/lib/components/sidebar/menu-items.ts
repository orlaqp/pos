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
    {
        id: '3',
        title: 'Reports',
        icon: 'clipboard-list-outline',
        children: [
            { id: '3-0', title: 'End of Day' },
            { id: '3-1', title: 'Sale List' },
            { id: '3-2', title: 'By Employee' },
            { id: '3-3', title: 'By Product' },
        ],
        role: Role.Admin,
    },
    {
        id: '8',
        title: 'Employees',
        icon: 'account-group-outline',
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
    {
        id: '4',
        title: 'Inventory',
        icon: 'warehouse',
        children: [
            { id: '4-1', title: 'In Stock' },
            { id: '4-2', title: 'Counts' },
            { id: '4-3', title: 'Receives' },
        ],
        role: Role.Admin,
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
            { id: '7-0', title: 'General' },
            { id: '7-1', title: 'Store' },
            { id: '7-2', title: 'Station' },
            { id: '7-3', title: 'Printers' },
            { id: '7-4', title: 'Logs' },
            // { id: '7-3', title: 'Receipt' },
        ],
    },
];
