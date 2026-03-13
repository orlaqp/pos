/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Pressable, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockEmployeeSave = jest.fn(() => Promise.resolve());
let mockSelectedEmployee: any = {
    id: 'emp-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    roles: ['ADMIN'],
    active: true,
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) =>
        selector({ employees: { selected: mockSelectedEmployee } }),
}));

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        page: {},
        centeredHorizontally: {},
        row: {},
        primaryText: {},
        textBold: {},
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
            <Pressable testID="employee-form-save" onPress={submitAction}>
                <Text>Save</Text>
            </Pressable>
            <Pressable testID="employee-form-cancel" onPress={cancelAction}>
                <Text>Cancel</Text>
            </Pressable>
        </View>
    ),
    UIInput: ({ name }: { name: string }) => <View testID={`employee-input-${name}`} />,
    UISwitch: ({ name }: { name: string }) => <View testID={`employee-switch-${name}`} />,
    UiFileUpload: () => <View testID="employee-upload" />,
    UIVerticalSpacer: () => <View testID="employee-spacer" />,
}));

jest.mock('@rneui/themed', () => ({
    CheckBox: ({
        title,
        onPress,
    }: {
        title: string;
        onPress: () => void;
    }) => (
        <Pressable testID={`employee-role-${title}`} onPress={onPress}>
            <Text>{title}</Text>
        </Pressable>
    ),
}));

jest.mock('@pos/auth/data-access', () => ({
    Role: {
        ADMIN: 'ADMIN',
        CASHIER: 'CASHIER',
    },
}));

jest.mock('@pos/employees/data-access', () => ({
    EmployeeService: {
        save: (...args: unknown[]) => mockEmployeeSave(...args),
    },
}));

const {
    EmployeeForm,
    buildEmployeeRoleMap,
    getEmployeeDefaults,
    toggleEmployeeRoleSet,
} = require('./employee-form');

describe('EmployeeForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectedEmployee = {
            id: 'emp-1',
            firstName: 'Ada',
            lastName: 'Lovelace',
            roles: ['ADMIN'],
            active: true,
        };
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('saves employee and navigates back on submit', async () => {
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<EmployeeForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('employee-form-save'));

        await waitFor(() => {
            expect(mockEmployeeSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({ id: 'emp-1', firstName: 'Ada' })
            );
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('removes id before save when creating a new employee', async () => {
        mockSelectedEmployee = {
            firstName: 'New',
            lastName: 'User',
            roles: [],
            active: true,
        };
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<EmployeeForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('employee-form-save'));

        await waitFor(() => {
            const savedPayload = mockEmployeeSave.mock.calls[0][1];
            expect(savedPayload.id).toBeUndefined();
        });
    });

    it('confirms cancel and navigates back when user accepts', () => {
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<EmployeeForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('employee-form-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        yesOption.onPress();
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('does not navigate back when cancel confirmation is rejected', () => {
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<EmployeeForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('employee-form-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const noOption = options.find((o: { text: string }) => o.text === 'No');
        noOption.onPress && noOption.onPress();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('updates roles when toggling checkboxes', async () => {
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<EmployeeForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('employee-role-CASHIER'));
        fireEvent.press(getByTestId('employee-form-save'));

        await waitFor(() => {
            const savedPayload = mockEmployeeSave.mock.calls[0][1];
            expect(savedPayload.roles).toEqual(
                expect.arrayContaining(['ADMIN', 'CASHIER'])
            );
        });
    });

    it('removes a role when toggled off before save', async () => {
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<EmployeeForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('employee-role-ADMIN'));
        fireEvent.press(getByTestId('employee-form-save'));

        await waitFor(() => {
            const savedPayload = mockEmployeeSave.mock.calls[0][1];
            expect(savedPayload.roles).not.toContain('ADMIN');
        });
    });

    it('handles employee without roles and allows adding one', async () => {
        mockSelectedEmployee = {
            id: 'emp-2',
            firstName: 'No',
            lastName: 'Roles',
            active: true,
        };
        const navigation = { goBack: mockGoBack };
        const { getByTestId } = render(<EmployeeForm navigation={navigation as any} />);

        fireEvent.press(getByTestId('employee-role-ADMIN'));
        fireEvent.press(getByTestId('employee-form-save'));

        await waitFor(() => {
            const savedPayload = mockEmployeeSave.mock.calls[0][1];
            expect(savedPayload.roles).toEqual(['ADMIN']);
        });
    });

    it('builds employee defaults and role helpers', () => {
        expect(
            getEmployeeDefaults({ id: 'emp-1', firstName: 'Ada', active: undefined } as any)
                .active
        ).toBe(true);

        expect(buildEmployeeRoleMap(['ADMIN'])).toEqual(
            expect.objectContaining({
                ADMIN: true,
                CASHIER: false,
            })
        );

        const { nextRoles, roleSet } = toggleEmployeeRoleSet(
            { ADMIN: true, CASHIER: false },
            'CASHIER'
        );
        expect(nextRoles.CASHIER).toBe(true);
        expect(roleSet).toEqual(expect.arrayContaining(['ADMIN', 'CASHIER']));
    });
});
