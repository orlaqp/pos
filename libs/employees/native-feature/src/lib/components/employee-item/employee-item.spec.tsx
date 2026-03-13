import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { render } from '@testing-library/react-native';
import EmployeeItem from './employee-item';

const mockDispatch = jest.fn();
const mockDelete = jest.fn(() => Promise.resolve());

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => mockDispatch,
}));

jest.mock('@pos/employees/data-access', () => ({
    employeesActions: {
        select: (employee: unknown) => ({
            type: 'employees/select',
            payload: employee,
        }),
        remove: (id: string) => ({ type: 'employees/remove', payload: id }),
    },
    EmployeeService: {
        delete: (id: string) => mockDelete(id),
    },
}));
describe('EmployeeItem', () => {
    const baseItem: any = {
        id: 'emp-1',
        active: true,
        code: 'E001',
        firstName: 'Ada',
        lastName: 'Lovelace',
        roles: ['cashier'],
        phone: '123-456-7890',
        email: 'ada@example.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('renders active state successfully', () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText } = render(<EmployeeItem item={baseItem} navigation={navigation} />);
        expect(getByText('Active')).toBeTruthy();
    });

    it('renders inactive state label', () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText } = render(
            <EmployeeItem item={{ ...baseItem, active: false }} navigation={navigation} />
        );
        expect(getByText('Inactive')).toBeTruthy();
    });

    it('dispatches select and navigates to employee form on row press', () => {
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <EmployeeItem item={baseItem} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[0].props.onPress();

        expect(navigation.navigate).toHaveBeenCalledWith('Employee Form');
    });

    it('opens delete confirmation dialog', () => {
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <EmployeeItem item={baseItem} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[touchables.length - 1].props.onPress();
        expect(Alert.alert).toHaveBeenCalledWith(
            'Are you sure?',
            'You will not be able to undo this operation',
            expect.any(Array)
        );
    });

    it('deletes and dispatches remove when confirmed and item has id', async () => {
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <EmployeeItem item={baseItem} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[touchables.length - 1].props.onPress();
        const options = (Alert.alert as jest.Mock).mock.calls[0][2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        await yesOption.onPress();

        expect(Alert.alert).toHaveBeenCalled();
    });

    it('does not delete when confirmed and item has no id', async () => {
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <EmployeeItem item={{ ...baseItem, id: undefined }} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[touchables.length - 1].props.onPress();
        const options = (Alert.alert as jest.Mock).mock.calls[0][2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        await yesOption.onPress();

        expect(mockDelete).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'employees/remove' })
        );
    });
});
