export interface SignInRequest {
    email: string;
    password: string;
}

export const Role = {
    Admin: 'Admin',
    Payments: 'Payments',
    Sales: 'Sales',
    Discounts: 'Discounts',
    Checks: 'Receive Check Payment',
    VoidOrder: 'Void Sales',
    RemoveSale: 'Remove Sales',
    CreateCustomers: 'Create Customers',
    ManageCustomerCredit: 'Manage Customer Credit',
    ReceiveCustomerCreditPayments: 'Receive Customer Credit Payments',
}
