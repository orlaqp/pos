import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { InventoryReceiveLine } from './inventory-receive-line';

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

describe('InventoryReceiveLine', () => {
    beforeEach(() => {
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('keeps the latest typed quantity on blur', () => {
        const onUpdate = jest.fn();
        const onDelete = jest.fn();

        const { getByTestId } = render(
            <InventoryReceiveLine
                readOnly={false}
                item={{
                    productId: 'p-1',
                    productName: 'Aceitunas Jumbo',
                    unitOfMeasure: 'EA',
                    received: 0,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'recv-1',
                }}
                onUpdate={onUpdate}
                onDelete={onDelete}
            />
        );

        const input = getByTestId('inventory-receive-qty-aceitunas-jumbo');
        fireEvent(input, 'focus');
        fireEvent.changeText(input, '4');
        fireEvent(input, 'blur');

        expect(onUpdate).toHaveBeenLastCalledWith(
            expect.objectContaining({ productId: 'p-1', received: 4 })
        );
    });
});
