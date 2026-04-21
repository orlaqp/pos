import {
    getEbtEligibleTotal,
    getUnavailableProductMessages,
    isCartReady,
} from './cart.logic';

describe('cart.logic', () => {
    const cart = {
        items: [
            {
                product: { id: 'p1', price: 2.5, isEBTEligible: true },
                quantity: 4,
            },
            {
                product: { id: 'p2', price: 10, isEBTEligible: false },
                quantity: 1,
            },
        ],
    } as any;

    it('computes EBT-eligible total', () => {
        expect(getEbtEligibleTotal(cart)).toBe(10);
    });

    it('uses discounted line totals when computing EBT-eligible total', () => {
        const discountedCart = {
            items: [
                {
                    identifier: 'eligible-line',
                    product: { id: 'p1', price: 10, isEBTEligible: true },
                    quantity: 2,
                },
                {
                    identifier: 'non-ebt-line',
                    product: { id: 'p2', price: 20, isEBTEligible: false },
                    quantity: 1,
                },
            ],
            appliedDiscountSummary: {
                lineSummaries: [
                    {
                        lineId: 'eligible-line',
                        discounts: [],
                        lineDiscountTotal: 5,
                        allocatedOrderDiscountTotal: 9.76,
                        lineTotalBeforeTax: 5.24,
                    },
                ],
            },
        } as any;

        expect(getEbtEligibleTotal(discountedCart)).toBe(5.24);
    });

    it('checks cart readiness', () => {
        expect(isCartReady(cart)).toBe(true);
        expect(isCartReady({ items: [] } as any)).toBe(false);
        expect(
            isCartReady({
                items: [{ quantity: 0 }],
            } as any)
        ).toBe(false);
    });

    it('returns unavailable inventory messages', () => {
        const messages = getUnavailableProductMessages(
            [{ product: { id: 'p1' }, quantity: 6 }] as any,
            [{ id: 'p1', name: 'Apple', quantity: 3 }] as any
        );

        expect(messages).toEqual(['Apple -> -3']);
    });
});
