import { Role } from '@pos/auth/data-access';

export type CustomerPermissionSubject = {
    roles?: Array<string | null | undefined> | null;
};

export const getCustomerRoles = (
    subjectOrRoles?: CustomerPermissionSubject | Array<string | null | undefined> | null
) => {
    if (Array.isArray(subjectOrRoles)) {
        return subjectOrRoles.filter(Boolean) as string[];
    }

    return (subjectOrRoles?.roles ?? []).filter(Boolean) as string[];
};

export const hasCustomerRole = (
    subjectOrRoles: CustomerPermissionSubject | Array<string | null | undefined> | null | undefined,
    role: string
) => {
    const roles = getCustomerRoles(subjectOrRoles);
    return roles.includes(Role.Admin) || roles.includes(role);
};

export const canCreateCustomers = (
    subjectOrRoles?: CustomerPermissionSubject | Array<string | null | undefined> | null
) => hasCustomerRole(subjectOrRoles, Role.CreateCustomers);

export const canManageCustomerCredit = (
    subjectOrRoles?: CustomerPermissionSubject | Array<string | null | undefined> | null
) => hasCustomerRole(subjectOrRoles, Role.ManageCustomerCredit);

export const canReceiveCustomerCreditPayments = (
    subjectOrRoles?: CustomerPermissionSubject | Array<string | null | undefined> | null
) => hasCustomerRole(subjectOrRoles, Role.ReceiveCustomerCreditPayments);
