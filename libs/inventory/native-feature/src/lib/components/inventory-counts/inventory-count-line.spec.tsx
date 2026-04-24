import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { InventoryCountLine } from './inventory-count-line';

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        smallDataRow: {},
        centered: {},
        name: {},
        input: {},
        primaryText: {},
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
    Button: ({ onPress }: { onPress: () => void }) => {
        const { Pressable } = require('react-native');
        return <Pressable onPress={onPress} />;
    },
}));

jest.mock('react-native-gesture-handler', () => ({
    TextInput: require('react-native').TextInput,
}));

jest.mock('@pos/shared/utils', () => ({
    translateWithFallback: (_key: string, fallback: string) => fallback,
}));

describe('InventoryCountLine', () => {
    beforeEach(() => {
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('keeps the latest typed count on blur', () => {
        const onUpdate = jest.fn();
        const onDelete = jest.fn();

        const { getByTestId } = render(
            <InventoryCountLine
                readOnly={false}
                item={{
                    productId: 'p-1',
                    productName: 'Aceitunas Jumbo',
                    unitOfMeasure: 'EA',
                    current: 4,
                    newCount: 4,
                    comments: '',
                    inventoryCountLineInventoryCountId: 'count-1',
                } as any}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />
        );

        const input = getByTestId('inventory-count-qty-aceitunas-jumbo');
        fireEvent(input, 'focus');
        fireEvent.changeText(input, '8');
        fireEvent(input, 'blur');

        expect(onUpdate).toHaveBeenLastCalledWith(
            expect.objectContaining({ productId: 'p-1', newCount: 8 })
        );
    });
});
