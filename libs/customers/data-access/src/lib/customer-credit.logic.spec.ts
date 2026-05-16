import {
    canUseCustomerCredit,
    findDuplicateCustomerContact,
    getAvailableCredit,
    getCreditStatus,
    hasRequiredCustomerContact,
} from './customer-credit.logic';

describe('customer credit logic', () => {
    it('coalesces nullable credit values when calculating available credit', () => {
        expect(getAvailableCredit({ creditLimit: null, creditBalance: undefined })).toBe(0);
        expect(getAvailableCredit({ creditLimit: 100, creditBalance: null })).toBe(100);
        expect(getAvailableCredit({ creditLimit: undefined, creditBalance: 25 })).toBe(-25);
    });

    it('marks a customer over limit only when balance is greater than limit', () => {
        expect(getCreditStatus({ creditLimit: 100, creditBalance: 100 })).toBe('OK');
        expect(getCreditStatus({ creditLimit: 100, creditBalance: 100.01 })).toBe('OVER_LIMIT');
        expect(getCreditStatus({ creditLimit: null, creditBalance: null })).toBe('OK');
    });

    it('allows exact available credit and blocks invalid credit usage with UI-ready reasons', () => {
        expect(canUseCustomerCredit({ firstName: 'Ada', creditLimit: 50, creditBalance: 20 }, 30)).toEqual({
            allowed: true,
            reason: 'ALLOWED',
        });
        expect(canUseCustomerCredit(undefined, 10)).toEqual({
            allowed: false,
            reason: 'NO_CUSTOMER',
        });
        expect(canUseCustomerCredit({ firstName: 'Ada', active: false, creditLimit: 50, creditBalance: 0 }, 10)).toEqual({
            allowed: false,
            reason: 'INACTIVE_CUSTOMER',
        });
        expect(canUseCustomerCredit({ firstName: 'Ada', creditLimit: 50, creditBalance: 0 }, 0)).toEqual({
            allowed: false,
            reason: 'INVALID_AMOUNT',
        });
        expect(canUseCustomerCredit({ firstName: 'Ada', creditLimit: 50, creditBalance: 20 }, 31)).toEqual({
            allowed: false,
            reason: 'INSUFFICIENT_CREDIT',
        });
    });

    it('detects duplicate phone and email within the same tenant using normalized contact values', () => {
        const existing = [
            {
                id: 'customer-1',
                tenantId: 'tenant-1',
                firstName: 'Grace',
                phone: ' (555) 0100 ',
                email: ' GRACE@EXAMPLE.COM ',
            },
            {
                id: 'customer-2',
                tenantId: 'tenant-2',
                firstName: 'Grace',
                phone: '5550100',
                email: 'grace@example.com',
            },
        ];

        expect(
            findDuplicateCustomerContact(
                { id: 'customer-3', tenantId: 'tenant-1', firstName: 'Ada', phone: '5550100', email: 'grace@example.com' },
                existing
            )
        ).toEqual({
            phone: expect.objectContaining({ customerId: 'customer-1', value: '5550100' }),
            email: expect.objectContaining({ customerId: 'customer-1', value: 'grace@example.com' }),
        });

        expect(
            findDuplicateCustomerContact(
                { id: 'customer-1', tenantId: 'tenant-1', firstName: 'Grace Edit', phone: '555-0100', email: 'grace@example.com' },
                existing
            )
        ).toEqual({});

        expect(
            findDuplicateCustomerContact(
                { id: 'customer-3', tenantId: 'tenant-2', firstName: 'Ada', phone: '555-0100', email: 'grace@example.com' },
                existing
            )
        ).toEqual({
            phone: expect.objectContaining({ customerId: 'customer-2' }),
            email: expect.objectContaining({ customerId: 'customer-2' }),
        });
    });

    it('requires either a normalized phone or email contact', () => {
        expect(hasRequiredCustomerContact({ phone: '', email: ' ' })).toBe(false);
        expect(hasRequiredCustomerContact({ phone: '(555) 0100', email: '' })).toBe(true);
        expect(hasRequiredCustomerContact({ phone: '', email: 'ada@example.com' })).toBe(true);
    });
});
