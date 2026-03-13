/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Pressable, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockUnitSave = jest.fn(() => Promise.resolve());
let mockSelectedUom: any = {
    id: 'uom-1',
    name: 'ea',
    description: 'Each',
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) =>
        selector({ unitOfMeasures: { selected: mockSelectedUom } }),
}));

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        page: {},
        centeredHorizontally: {},
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIActions: ({
        submitAction,
        cancelAction,
    }: {
        submitAction: () => void;
        cancelAction: () => void;
    }) => (
        <View>
            <Pressable testID="uom-form-save" onPress={submitAction}>
                <Text>Save</Text>
            </Pressable>
            <Pressable testID="uom-form-cancel" onPress={cancelAction}>
                <Text>Cancel</Text>
            </Pressable>
        </View>
    ),
    UIInput: ({ name }: { name: string }) => <View testID={`uom-input-${name}`} />,
}));

jest.mock('@pos/unit-of-measures/data-access', () => ({
    UnitOfMeasureService: {
        save: (...args: unknown[]) => mockUnitSave(...args),
    },
}));

const { UnitOfMeasureForm } = require('./unit-of-measure-form');

describe('UnitOfMeasureForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectedUom = { id: 'uom-1', name: 'ea', description: 'Each' };
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('saves selected unit and navigates back', async () => {
        const { getByTestId } = render(
            <UnitOfMeasureForm navigation={{ goBack: mockGoBack } as any} />
        );
        fireEvent.press(getByTestId('uom-form-save'));

        await waitFor(() => {
            expect(mockUnitSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({ id: 'uom-1', name: 'ea' })
            );
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('removes id for new unit save', async () => {
        mockSelectedUom = { name: 'box', description: 'Box' };
        const { getByTestId } = render(
            <UnitOfMeasureForm navigation={{ goBack: mockGoBack } as any} />
        );
        fireEvent.press(getByTestId('uom-form-save'));

        await waitFor(() => {
            const savedPayload = mockUnitSave.mock.calls[0][1];
            expect(savedPayload.id).toBeUndefined();
        });
    });

    it('confirms cancel and navigates back on confirmation', () => {
        const { getByTestId } = render(
            <UnitOfMeasureForm navigation={{ goBack: mockGoBack } as any} />
        );
        fireEvent.press(getByTestId('uom-form-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        yesOption.onPress();
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('does not navigate back when cancel is declined', () => {
        const { getByTestId } = render(
            <UnitOfMeasureForm navigation={{ goBack: mockGoBack } as any} />
        );
        fireEvent.press(getByTestId('uom-form-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const noOption = options.find((o: { text: string }) => o.text === 'No');
        if (typeof noOption.onPress === 'function') {
            noOption.onPress();
        }
        expect(mockGoBack).not.toHaveBeenCalled();
    });
});
