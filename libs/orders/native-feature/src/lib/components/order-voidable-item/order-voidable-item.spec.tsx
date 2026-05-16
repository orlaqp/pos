import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        dataRow: {},
        name: {},
        textRight: {},
    }),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { xs: 4, sm: 8 },
        radii: { md: 8 },
        colors: {
            border: '#2f3742',
            surfaceMuted: '#2f37422a',
            textMuted: '#8491a2',
        },
    }),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: { colors: { error: '#ff5f5f' } },
    }),
}));

jest.mock('@pos/unit-of-measures/data-access', () => ({
    EACH: 'EA',
}));

import { OrderVoidableItem } from './order-voidable-item';

describe('OrderVoidableItem', () => {
    const line = {
        identifier: 'line-1',
        productName: 'Huevo',
        quantity: 1,
        unitOfMeasure: 'EA',
        price: 4.99,
    } as any;

    it('toggles using the controlled selected prop', () => {
        const onToggle = jest.fn();
        const view = render(
            <OrderVoidableItem
                line={line}
                onToggle={onToggle}
                selected={false}
                testIDPrefix="available-line"
            />
        );

        fireEvent.press(view.getByTestId('available-line-line-1'));
        expect(onToggle).toHaveBeenCalledWith(line, true);

        view.rerender(
            <OrderVoidableItem
                line={line}
                onToggle={onToggle}
                selected
                testIDPrefix="available-line"
            />
        );

        fireEvent.press(view.getByTestId('available-line-line-1'));
        expect(onToggle).toHaveBeenLastCalledWith(line, false);
    });

    it('does not toggle when rendered in read-only mode', () => {
        const onToggle = jest.fn();
        const view = render(
            <OrderVoidableItem
                line={line}
                onToggle={onToggle}
                readOnly
                testIDPrefix="refunded-line"
            />
        );

        fireEvent.press(view.getByTestId('refunded-line-line-1'));
        expect(onToggle).not.toHaveBeenCalled();
    });

    it('shows the original cart-facing amount from basePrice when available', () => {
        const onToggle = jest.fn();
        const view = render(
            <OrderVoidableItem
                line={{
                    ...line,
                    quantity: 1,
                    price: 2.495,
                    basePrice: 4.99,
                } as any}
                onToggle={onToggle}
                testIDPrefix="available-line"
            />
        );

        expect(view.getByText('4.99')).toBeTruthy();
    });
});
