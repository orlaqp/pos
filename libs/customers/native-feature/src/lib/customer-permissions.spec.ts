import { Role } from '@pos/auth/data-access';
import {
    canCreateCustomers,
    canManageCustomerCredit,
    canReceiveCustomerCreditPayments,
    hasCustomerRole,
} from './customer-permissions';

describe('customer permission helpers', () => {
    it('treats admin as privileged for every customer permission', () => {
        const roles = [Role.Admin];

        expect(hasCustomerRole(roles, Role.CreateCustomers)).toBe(true);
        expect(canCreateCustomers(roles)).toBe(true);
        expect(canManageCustomerCredit(roles)).toBe(true);
        expect(canReceiveCustomerCreditPayments(roles)).toBe(true);
    });

    it('checks each native customer role independently', () => {
        expect(canCreateCustomers([Role.CreateCustomers])).toBe(true);
        expect(canCreateCustomers([Role.ManageCustomerCredit])).toBe(false);

        expect(canManageCustomerCredit([Role.ManageCustomerCredit])).toBe(true);
        expect(canManageCustomerCredit([Role.ReceiveCustomerCreditPayments])).toBe(false);

        expect(canReceiveCustomerCreditPayments([Role.ReceiveCustomerCreditPayments])).toBe(true);
        expect(canReceiveCustomerCreditPayments([Role.CreateCustomers])).toBe(false);
    });
});
