export interface SignInRequest {
    email: string;
    password: string;
}

export const Role = {
    Admin: 'Admin',
    Payments: 'Payments',
    Sales: 'Sales',
    Checks: 'Receive Check Payment',
    VoidOrder: 'Void Sales',
    RemoveSale: 'Remove Sales',
}
