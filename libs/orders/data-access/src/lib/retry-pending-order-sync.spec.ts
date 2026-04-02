import { DataStore } from '@pos/shared/amplify';
import { Order } from '@pos/shared/models';
import { OrderService } from './order.service';
import { retryPendingOrderJournalEntrySync } from './retry-pending-order-sync';

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        start: jest.fn(),
        query: jest.fn(),
        save: jest.fn(),
    },
}));

jest.mock('@pos/shared/models', () => ({
    Order: {
        copyOf: jest.fn((source, mutator) => {
            const draft = {
                ...source,
            };
            mutator(draft);
            return draft;
        }),
    },
    OrderStatus: {
        OPEN: 'OPEN',
        PAID: 'PAID',
    },
}));

jest.mock('./order.service', () => ({
    OrderService: {
        create: jest.fn(),
        closeOrder: jest.fn(),
    },
}));

describe('retryPendingOrderJournalEntrySync', () => {
    const employee = {
        id: 'employee-1',
        firstName: 'Alex',
        lastName: 'Cashier',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('touches an already-paid local order to requeue sync without rerunning payment logic', async () => {
        jest.mocked(DataStore.query).mockResolvedValue({
            id: 'order-1',
            status: 'PAID',
            orderNo: '1001',
        } as never);
        jest.mocked(DataStore.save).mockResolvedValue({
            id: 'order-1',
            status: 'PAID',
        } as never);

        await retryPendingOrderJournalEntrySync(
            {
                orderId: 'order-1',
                orderNo: '1001',
                tenantId: 'tenant-1',
                statusTarget: 'PAID',
                cart: {
                    id: 'order-1',
                    items: [],
                    footer: { total: 0 } as any,
                    definitions: [],
                    manualDiscounts: [],
                    priceOverrides: [],
                    promoCodes: [],
                    approvalEvents: [],
                },
                payments: [{ type: 'cash', amount: 10 } as any],
                createdAt: '2026-04-02T00:00:00.000Z',
                updatedAt: '2026-04-02T00:00:00.000Z',
                syncState: 'sync_failed',
            },
            employee
        );

        expect(DataStore.start).toHaveBeenCalled();
        expect(DataStore.query).toHaveBeenCalled();
        expect(DataStore.save).toHaveBeenCalled();
        expect(OrderService.closeOrder).not.toHaveBeenCalled();
        expect(OrderService.create).not.toHaveBeenCalled();
    });

    it('rebuilds a missing paid order from the journal and closes it', async () => {
        jest.mocked(DataStore.query).mockResolvedValue(null as never);
        jest.mocked(OrderService.create).mockResolvedValue({
            id: 'order-2',
            orderNo: '1002',
        } as never);
        jest.mocked(OrderService.closeOrder).mockResolvedValue({
            id: 'order-2',
            status: 'PAID',
        } as never);

        await retryPendingOrderJournalEntrySync(
            {
                orderId: 'order-2',
                orderNo: '1002',
                tenantId: 'tenant-1',
                statusTarget: 'PAID',
                cart: {
                    id: 'order-2',
                    orderNo: '1002',
                    items: [],
                    footer: { total: 0 } as any,
                    definitions: [],
                    manualDiscounts: [],
                    priceOverrides: [],
                    promoCodes: [],
                    approvalEvents: [],
                },
                payments: [{ type: 'cash', amount: 15 } as any],
                createdAt: '2026-04-02T00:00:00.000Z',
                updatedAt: '2026-04-02T00:00:00.000Z',
                syncState: 'local_only',
            },
            employee
        );

        expect(OrderService.create).toHaveBeenCalledWith(
            expect.objectContaining({
                by: employee,
            })
        );
        expect(OrderService.closeOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'order-2',
                payments: [{ type: 'cash', amount: 15 }],
            })
        );
    });
});
