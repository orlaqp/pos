/* eslint-disable import/first */
jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        query: jest.fn(),
        save: jest.fn(async (value) => value),
        delete: jest.fn(),
    },
}));

jest.mock('@pos/shared/models', () => {
    class MockCustomer {
        constructor(init: Record<string, unknown>) {
            Object.assign(this, init);
        }

        static copyOf(
            source: Record<string, unknown>,
            mutator: (draft: Record<string, unknown>) => void
        ) {
            const draft = { ...source };
            mutator(draft);
            return draft;
        }
    }

    return {
        Customer: MockCustomer,
        CustomerCreditStatus: {
            OK: 'OK',
            OVER_LIMIT: 'OVER_LIMIT',
        },
    };
});

import { DataStore } from '@pos/shared/amplify';
import { CustomerEntityMapper } from './customer.entity';
import { CustomerService } from './customer.service';

const queryMock = DataStore.query as jest.Mock;
const saveMock = DataStore.save as jest.Mock;
const deleteMock = DataStore.delete as jest.Mock;

describe('CustomerEntityMapper', () => {
    it('coalesces nullable credit fields and includes a display name', () => {
        expect(
            CustomerEntityMapper.fromModel(
                {
                    id: 'customer-1',
                    tenantId: 'tenant-1',
                    firstName: ' Ada ',
                    lastName: ' Lovelace ',
                    active: null,
                    creditLimit: null,
                    creditBalance: undefined,
                    creditStatus: null,
                } as Parameters<typeof CustomerEntityMapper.fromModel>[0]
            )
        ).toEqual(
            expect.objectContaining({
                displayName: 'Ada Lovelace',
                active: true,
                creditLimit: 0,
                creditBalance: 0,
                creditStatus: 'OK',
            })
        );
    });
});

describe('CustomerService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryMock.mockResolvedValue([]);
        saveMock.mockImplementation(async (value) => ({
            id: value.id || 'created-customer',
            ...value,
        }));
    });

    it('searches locally fetched customers by name, phone, and email', async () => {
        queryMock.mockResolvedValueOnce([
            {
                id: 'customer-1',
                tenantId: 'tenant-1',
                firstName: 'Ada',
                lastName: 'Lovelace',
                phone: '555-0100',
            },
            {
                id: 'customer-2',
                tenantId: 'tenant-1',
                firstName: 'Grace',
                lastName: 'Hopper',
                email: 'grace@example.com',
            },
        ]);

        await expect(CustomerService.search('lovelace')).resolves.toEqual([
            expect.objectContaining({ id: 'customer-1' }),
        ]);
        queryMock.mockResolvedValueOnce([
            {
                id: 'customer-1',
                tenantId: 'tenant-1',
                firstName: 'Ada',
                lastName: 'Lovelace',
                phone: '555-0100',
            },
            {
                id: 'customer-2',
                tenantId: 'tenant-1',
                firstName: 'Grace',
                lastName: 'Hopper',
                email: 'grace@example.com',
            },
        ]);
        await expect(CustomerService.search('GRACE@EXAMPLE.COM')).resolves.toEqual([
            expect.objectContaining({ id: 'customer-2' }),
        ]);
    });

    it('finds duplicate phone and email contacts before saving', async () => {
        queryMock.mockResolvedValueOnce([
            {
                id: 'customer-1',
                tenantId: 'tenant-1',
                firstName: 'Grace',
                phone: '555-0100',
                email: 'grace@example.com',
            },
        ]);

        await expect(
            CustomerService.findDuplicateContact({
                firstName: 'Ada',
                tenantId: 'tenant-1',
                phone: ' 555-0100 ',
                email: ' GRACE@example.com ',
            })
        ).resolves.toEqual({
            phone: expect.objectContaining({ customerId: 'customer-1' }),
            email: expect.objectContaining({ customerId: 'customer-1' }),
        });
    });

    it('creates a customer with tenant ownership and concrete credit defaults', async () => {
        queryMock.mockResolvedValueOnce([]);

        await expect(
            CustomerService.save({
                firstName: 'Ada',
                tenantId: 'tenant-1',
                lastName: 'Lovelace',
                phone: '555-0100',
                creditLimit: null,
                creditBalance: undefined,
                creditStatus: null,
            })
        ).resolves.toEqual(
            expect.objectContaining({
                id: 'created-customer',
                tenantId: 'tenant-1',
                displayName: 'Ada Lovelace',
                active: true,
                creditLimit: 0,
                creditBalance: 0,
                creditStatus: 'OK',
            })
        );

        expect(saveMock).toHaveBeenCalledWith(
            expect.objectContaining({
                tenantId: 'tenant-1',
                active: true,
                creditLimit: 0,
                creditBalance: 0,
                creditStatus: 'OK',
            })
        );
        expect(saveMock.mock.calls[0][0]).not.toHaveProperty('displayName');
    });

    it('rejects saving duplicate phone or email contacts', async () => {
        queryMock.mockResolvedValueOnce([
            {
                id: 'customer-1',
                tenantId: 'tenant-1',
                firstName: 'Grace',
                phone: '555-0100',
            },
        ]);

        await expect(
            CustomerService.save({
                firstName: 'Ada',
                tenantId: 'tenant-1',
                phone: '555-0100',
            })
        ).rejects.toThrow('Customer phone 5550100 already exists');

        expect(saveMock).not.toHaveBeenCalled();
    });

    it('requires phone or email before saving', async () => {
        await expect(
            CustomerService.save({
                firstName: 'Ada',
                tenantId: 'tenant-1',
            })
        ).rejects.toThrow('Customer phone or email is required');

        expect(queryMock).not.toHaveBeenCalled();
        expect(saveMock).not.toHaveBeenCalled();
    });

    it('updates an existing customer and preserves save defaults', async () => {
        queryMock
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce({
                id: 'customer-1',
                tenantId: 'tenant-1',
                firstName: 'Ada',
                creditLimit: null,
                creditBalance: null,
            });

        await CustomerService.save({
            id: 'customer-1',
            tenantId: 'tenant-1',
            firstName: 'Ada',
            lastName: 'Byron',
            phone: '555-0100',
            creditLimit: 25,
            creditBalance: 30,
        });

        expect(saveMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'customer-1',
                lastName: 'Byron',
                creditLimit: 25,
                creditBalance: 30,
                creditStatus: 'OVER_LIMIT',
            })
        );
        expect(saveMock.mock.calls[0][0]).not.toHaveProperty('displayName');
    });

    it('rejects updates and deletes when tenant ownership does not match', async () => {
        queryMock
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce({
                id: 'customer-1',
                tenantId: 'tenant-2',
                firstName: 'Ada',
                phone: '555-0100',
            });

        await expect(
            CustomerService.save({
                id: 'customer-1',
                tenantId: 'tenant-1',
                firstName: 'Ada',
                phone: '555-0100',
            })
        ).rejects.toThrow('Customer tenant mismatch');

        queryMock.mockResolvedValueOnce({
            id: 'customer-1',
            tenantId: 'tenant-2',
            firstName: 'Ada',
        });

        await expect(CustomerService.delete('customer-1', 'tenant-1')).rejects.toThrow(
            'Customer tenant mismatch'
        );
    });

    it('gets and deletes customers by id', async () => {
        queryMock.mockResolvedValueOnce({
            id: 'customer-1',
            tenantId: 'tenant-1',
            firstName: 'Ada',
        });
        await expect(CustomerService.getById('customer-1')).resolves.toEqual(
            expect.objectContaining({ id: 'customer-1' })
        );

        queryMock.mockResolvedValueOnce({
            id: 'customer-1',
            tenantId: 'tenant-1',
            firstName: 'Ada',
        });
        await CustomerService.delete('customer-1');
        expect(deleteMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'customer-1' }));
    });
});
