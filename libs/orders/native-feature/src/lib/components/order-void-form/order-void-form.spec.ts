import {
    calculateRefundSummary,
    spreadOrderLinesForVoid,
} from './order-void-form.logic';
import { EACH } from '@pos/unit-of-measures/data-access';

jest.mock('@pos/unit-of-measures/data-access', () => ({
    EACH: 'EA',
}));

describe('order-void-form helpers', () => {
    it('spreads EACH lines to unit entries', () => {
        const lines = [
            {
                identifier: 'l1',
                productId: 'p1',
                barcode: null,
                sku: null,
                productName: 'Apple',
                unitOfMeasure: EACH,
                quantity: 3,
                tax: 0,
                price: 2.5,
            },
            {
                identifier: 'l2',
                productId: 'p2',
                barcode: null,
                sku: null,
                productName: 'Rice',
                unitOfMeasure: 'LB',
                quantity: 1.75,
                tax: 0,
                price: 4,
            },
        ];

        const result = spreadOrderLinesForVoid(lines);

        expect(result).toHaveLength(4);
        expect(result[0].quantity).toBe(1);
        expect(result[1].quantity).toBe(1);
        expect(result[2].quantity).toBe(1);
        expect(result[3].identifier).toBe('l2');
        expect(result[3].quantity).toBe(1.75);
    });

    it('calculates refund total and new total', () => {
        const linesToRefund = [
            {
                identifier: 'a',
                productId: 'p1',
                barcode: null,
                sku: null,
                productName: 'A',
                unitOfMeasure: 'EA',
                quantity: 2,
                tax: 0,
                price: 3,
            },
            {
                identifier: 'b',
                productId: 'p2',
                barcode: null,
                sku: null,
                productName: 'B',
                unitOfMeasure: EACH,
                quantity: 1,
                tax: 0,
                price: 4.5,
            },
        ];

        const summary = calculateRefundSummary(25, linesToRefund);
        expect(summary.refundTotal).toBe(10.5);
        expect(summary.newTotal).toBe(14.5);
    });

    it('uses saved discounted line totals when calculating refunds', () => {
        const linesToRefund = [
            {
                identifier: 'a',
                productId: 'p1',
                barcode: null,
                sku: null,
                productName: 'Discounted A',
                unitOfMeasure: 'EA',
                quantity: 1,
                tax: 0,
                price: 10,
                lineTotalBeforeTax: 7.5,
            },
        ];

        const summary = calculateRefundSummary(25, linesToRefund as any);
        expect(summary.refundTotal).toBe(7.5);
        expect(summary.newTotal).toBe(17.5);
    });

    it('spreads EACH lines using per-unit discounted totals', () => {
        const lines = [
            {
                identifier: 'l1',
                productId: 'p1',
                barcode: null,
                sku: null,
                productName: 'Apple',
                unitOfMeasure: EACH,
                quantity: 2,
                tax: 0,
                price: 10,
                lineTotalBeforeTax: 8,
                lineDiscountTotal: 2,
            },
        ];

        const result = spreadOrderLinesForVoid(lines as any);

        expect(result).toHaveLength(2);
        expect(result[0].quantity).toBe(1);
        expect(result[0].price).toBe(5);
        expect(result[0].lineTotalBeforeTax).toBe(4);
        expect(result[0].lineDiscountTotal).toBe(1);
    });
});
