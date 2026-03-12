/* eslint-disable @typescript-eslint/no-var-requires */
jest.mock('react-native', () => ({
    Alert: { alert: jest.fn() },
}));

jest.mock('@pos/settings/data-access', () => ({
    StationService: {
        getNextOrderNumber: jest.fn(async () => '51-TEST-0003'),
    },
}));

jest.mock('@pos/employees/data-access', () => ({
    EmployeeService: {
        getById: jest.fn(),
    },
}));

const { OrderEntityMapper } = require('./order.entity');

describe('OrderEntityMapper', () => {
    it('strips EBT/NON-EBT prefixes from order line names', () => {
        const nonEbtLine = OrderEntityMapper.fromLine({
            identifier: 'line-1',
            productId: 'p-1',
            barcode: null,
            sku: null,
            productName: 'NON-EBT Shampoo Fixture',
            quantity: 1,
            price: 6.5,
            tax: 0,
            unitOfMeasure: 'EA',
        });

        const ebtLine = OrderEntityMapper.fromLine({
            identifier: 'line-2',
            productId: 'p-2',
            barcode: null,
            sku: null,
            productName: 'EBT Apple Fixture',
            quantity: 1,
            price: 2.49,
            tax: 0,
            unitOfMeasure: 'EA',
        });

        expect(nonEbtLine.productName).toBe('Shampoo Fixture');
        expect(ebtLine.productName).toBe('Apple Fixture');
    });

    it('sanitizes names when building cart state from order entity', () => {
        const cart = OrderEntityMapper.asCartState({
            id: 'o-1',
            orderNo: '51-TEST-0001',
            subtotal: 10,
            tax: 0,
            total: 10,
            status: 'OPEN',
            employeeId: 'e-1',
            employeeName: 'Tester',
            orderDate: '2026-03-12T00:00:00.000Z',
            lines: [
                {
                    identifier: 'line-1',
                    productId: 'p-1',
                    barcode: null,
                    sku: null,
                    productName: 'NON-EBT Soap Fixture',
                    quantity: 1,
                    tax: 0,
                    price: 10,
                    unitOfMeasure: 'EA',
                    isEBTEligible: false,
                },
            ],
            payments: null,
            paymentInfo: null,
            refundInfo: null,
        });

        expect(cart.items[0].product.name).toBe('Soap Fixture');
    });

    it('maps payment info payments from order model', () => {
        const orderEntity = OrderEntityMapper.fromModel({
            id: 'o-2',
            orderNo: '51-TEST-0002',
            subtotal: 40,
            tax: 0,
            total: 40,
            status: 'PAID',
            employeeId: 'e-1',
            employeeName: 'Tester',
            orderDate: '2026-03-12T00:00:00.000Z',
            createdAt: '2026-03-12T00:00:00.000Z',
            updatedAt: '2026-03-12T00:00:00.000Z',
            lines: [],
            paymentInfo: {
                employeeId: 'e-1',
                employeeName: 'Tester',
                payments: [{ type: 'EBT', amount: 24.9 }],
            },
            refundInfo: null,
        });

        expect(orderEntity.paymentInfo?.payments).toEqual([
            { type: 'EBT', amount: 24.9 },
        ]);
    });
});
