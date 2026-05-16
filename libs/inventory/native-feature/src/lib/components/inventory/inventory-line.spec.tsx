import React from 'react';
import { render } from '@testing-library/react-native';
import { InventoryLine } from './inventory-line';

jest.mock('@pos/shared/utils', () => ({
    translateWithFallback: (_key: string, fallback: string) => fallback,
}));

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        smallDataRow: {},
        name: {},
        description: {},
        input: {},
        primaryText: {},
    }),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: {
            xs: 4,
            sm: 8,
            md: 12,
        },
        colors: {
            textPrimary: '#fff',
            textMuted: '#889',
        },
    }),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                error: '#f00',
            },
        },
    }),
}));

jest.mock('react-native-gesture-handler', () => ({
    TextInput: require('react-native').TextInput,
}));

jest.mock('@pos/orders/data-access', () => ({
    OrderService: {
        updateReorderPoint: jest.fn(),
        updateReorderQuantity: jest.fn(),
    },
}));

describe('InventoryLine', () => {
    it('renders the product description as a subtitle when present', () => {
        const { getByText, getByTestId } = render(
            <InventoryLine
                item={{
                    id: 'p-1',
                    name: 'Aceitunas Jumbo',
                    description: 'Large green olives from Spain\nPacked in brine',
                    quantity: 12,
                    reorderPoint: 4,
                    reorderQuantity: 8,
                } as any}
            />
        );

        expect(getByText('Aceitunas Jumbo')).toBeTruthy();
        expect(
            getByTestId('inventory-stock-description-aceitunas-jumbo')
        ).toBeTruthy();
        expect(getByText('Large green olives from Spain\nPacked in brine')).toBeTruthy();
        expect(
            getByTestId('inventory-stock-description-aceitunas-jumbo').props.numberOfLines
        ).toBeUndefined();
        expect(getByTestId('inventory-stock-description-aceitunas-jumbo').props.style).toEqual(
            expect.arrayContaining([false])
        );
    });

    it('uses a lighter subtitle color on low inventory rows', () => {
        const { getByTestId } = render(
            <InventoryLine
                item={{
                    id: 'p-1',
                    name: 'Aceitunas Jumbo',
                    description: 'Large green olives',
                    quantity: 2,
                    reorderPoint: 4,
                    reorderQuantity: 8,
                } as any}
            />
        );

        expect(getByTestId('inventory-stock-description-aceitunas-jumbo').props.style).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    color: 'rgba(255, 255, 255, 0.9)',
                }),
            ])
        );
    });

    it('does not render a subtitle when description is missing', () => {
        const { queryByTestId } = render(
            <InventoryLine
                item={{
                    id: 'p-1',
                    name: 'Aceitunas Jumbo',
                    description: '',
                    quantity: 12,
                    reorderPoint: 4,
                    reorderQuantity: 8,
                } as any}
            />
        );

        expect(
            queryByTestId('inventory-stock-description-aceitunas-jumbo')
        ).toBeNull();
    });
});
