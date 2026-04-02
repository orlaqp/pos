import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';

const mockDispatch = jest.fn();
const mockState: any = {
    auth: {
        user: {
            name: 'Owner User',
            email: 'owner@example.com',
        },
    },
    tenantSession: {
        businessName: 'Test Business',
    },
    employees: {
        loginEmployee: {
            id: 'employee-1',
            roles: ['Sales'],
        },
        initialEmployeeSyncComplete: true,
        loadingStatus: 'loaded',
        all: [{ id: 'employee-1' }],
    },
    storeInfo: {
        store: { id: 'store-1', name: 'Test Store' },
        initialStoreSyncComplete: true,
    },
    settings: {
        station: { stationNumber: '01' },
    },
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) => selector(mockState),
}));

jest.mock('react-hook-form', () => ({
    useForm: () => ({
        reset: jest.fn(),
        control: {},
        handleSubmit: (handler: (value: unknown) => void) => handler,
        watch: jest.fn(),
        formState: { isValid: true, errors: {} },
    }),
}));

jest.mock('@rneui/themed', () => ({
    Text: ({ children }: { children: React.ReactNode }) => {
        const { Text } = require('react-native');
        return <Text>{children}</Text>;
    },
    Icon: () => null,
}));

jest.mock('@pos/auth/data-access', () => ({
    authActions: {
        logoff: () => ({ type: 'auth/logoff' }),
    },
    clearRememberedAdminCredentials: jest.fn(async () => undefined),
    clearCurrentTenantContext: jest.fn(),
    getRememberedAdminCredentialStatus: jest.fn(async () => ({
        enabled: true,
        username: 'owner@example.com',
    })),
    Role: {
        Sales: 'Sales',
        Payments: 'Payments',
        Admin: 'Admin',
    },
    tenantSessionActions: {
        clearTenantSession: () => ({ type: 'tenantSession/clearTenantSession' }),
    },
}));

jest.mock('@pos/employees/data-access', () => ({
    employeesActions: {
        loginEmployee: (payload: unknown) => ({ type: 'employees/loginEmployee', payload }),
        setAll: (payload: unknown) => ({ type: 'employees/setAll', payload }),
    },
    EmployeeService: {
        getEmployee: jest.fn(),
        getAll: jest.fn(async () => []),
        getLocalEmployees: jest.fn(async () => []),
        save: jest.fn(),
    },
    selectAllEmployees: (state: any) => state.employees.all,
    selectInitialEmployeeSyncComplete: (state: any) =>
        state.employees.initialEmployeeSyncComplete,
    selectLoadingStatus: (state: any) => state.employees.loadingStatus,
    selectLoginEmployee: (state: any) => state.employees.loginEmployee,
}));

jest.mock('@pos/settings/data-access', () => ({
    selectStation: (state: any) => state.settings.station,
}));

jest.mock('@pos/sales/data-access', () => ({
    cartActions: {
        reset: () => ({ type: 'cart/reset' }),
    },
}));

jest.mock('@pos/store-info/data-access', () => ({
    isStoreInfoIncomplete: jest.fn(() => false),
    selectPreferredStore: (stores: any[]) => stores[0],
    selectInitialStoreSyncComplete: (state: any) => state.storeInfo.initialStoreSyncComplete,
    selectStore: (state: any) => state.storeInfo.store,
    storeInfoActions: {
        set: (payload: unknown) => ({ type: 'storeInfo/set', payload }),
    },
    StoreInfoEntityMapper: {
        fromModel: (value: unknown) => value,
    },
    StoreInfoService: {
        getStore: jest.fn(async () => []),
        save: jest.fn(),
    },
}));

jest.mock('@pos/shared/amplify', () => ({
    Auth: {
        signOut: jest.fn(),
    },
    DataStore: {
        stop: jest.fn(),
        clear: jest.fn(),
    },
}));

jest.mock('./HomeScreen.styles', () => ({
    useHomeScreenStyles: () => ({
        page: {},
        container: {},
        containerContent: {},
        shell: {},
        hero: {},
        brandMark: {},
        businessLabel: {},
        heroTitle: {},
        heroSubtitle: {},
        keypadCard: {},
        keypadTitle: {},
        keypadHint: {},
        pinLogoffButton: {},
        pinLogoffButtonText: {},
        setupLogoffButtonText: {},
        routeGrid: {},
        bigButton: {},
        centered: {},
        routeIconWrap: {},
        routeTitle: {},
    }),
}));

jest.mock('./home-setup-wizard', () => ({
    HomeSetupWizard: ({ onLogoff }: { onLogoff?: () => void }) => {
        const { View, Pressable, Text } = require('react-native');
        return (
            <View testID="home-setup-wizard">
                <Pressable testID="home-setup-logoff-button" onPress={onLogoff}>
                    <Text>Log off business</Text>
                </Pressable>
            </View>
        );
    },
}));

jest.mock('./home-pin-login', () => ({
    HomePinLogin: ({
        onLogoff,
        onRemoveSavedLogin,
        savedLoginStatusLabel,
    }: {
        onLogoff?: () => void;
        onRemoveSavedLogin?: () => void;
        savedLoginStatusLabel?: string;
    }) => {
        const { Pressable, Text, View } = require('react-native');
        return (
            <View testID="home-pin-login">
                <Text>{savedLoginStatusLabel}</Text>
                <Pressable testID="home-pin-logoff-button" onPress={onLogoff}>
                    <Text>Log off business</Text>
                </Pressable>
                <Pressable
                    testID="home-pin-remove-saved-login-button"
                    onPress={onRemoveSavedLogin}
                >
                    <Text>Remove saved login from this device</Text>
                </Pressable>
            </View>
        );
    },
}));

jest.mock('./use-pin-lock', () => ({
    clearPinLockState: jest.fn(),
    formatLockCountdown: jest.fn(() => '5:00'),
    MAX_PIN_ATTEMPTS: 3,
    PIN_LOCK_DURATION_MS: 300000,
    readPinLockState: jest.fn(async () => ({
        failedAttempts: 0,
        lockedUntil: null,
    })),
    writePinLockState: jest.fn(),
}));

describe('HomeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockState.settings.station = { stationNumber: '01' };
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    });

    afterEach(() => {
        (Alert.alert as jest.Mock).mockRestore?.();
    });

    it('opens Sales immediately when station number is already in Redux', async () => {
        const navigation = {
            navigate: jest.fn(),
        } as any;

        const { getByTestId } = render(<HomeScreen navigation={navigation} />);

        await act(async () => {
            fireEvent.press(getByTestId('home-nav-sales'));
            await Promise.resolve();
        });

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/reset' })
        );
        expect(navigation.navigate).toHaveBeenCalledWith('Sales', { mode: 'order' });
    });

    it('shows a station validation alert instead of navigating when station number is missing', async () => {
        mockState.settings.station = { stationNumber: '' };
        const navigation = {
            navigate: jest.fn(),
        } as any;

        const { getByTestId } = render(<HomeScreen navigation={navigation} />);

        await act(async () => {
            fireEvent.press(getByTestId('home-nav-sales'));
            await Promise.resolve();
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Please make sure station number is set before making sales'
        );
        expect(navigation.navigate).not.toHaveBeenCalled();
    });

    it('shows a confirmation before logging off from the PIN screen', async () => {
        mockState.employees.loginEmployee = undefined;
        mockState.employees.all = [{ id: 'employee-1' }];
        const navigation = {
            navigate: jest.fn(),
        } as any;

        const { getByTestId } = render(<HomeScreen navigation={navigation} />);

        await act(async () => {
            fireEvent.press(getByTestId('home-pin-logoff-button'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Log off business?',
            'This will sign out the admin session on this device.',
            expect.any(Array)
        );
    });

    it('offers removing saved credentials without logging out immediately', async () => {
        mockState.employees.loginEmployee = undefined;
        mockState.employees.all = [{ id: 'employee-1' }];
        const navigation = {
            navigate: jest.fn(),
        } as any;

        const { getByTestId } = render(<HomeScreen navigation={navigation} />);

        await act(async () => {
            fireEvent.press(getByTestId('home-pin-remove-saved-login-button'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Remove saved login?',
            'This only removes the stored admin username and password from this device. Your current admin session will stay active.',
            expect.any(Array)
        );
    });

    it('rechecks local employees before showing setup again', async () => {
        const { EmployeeService } = require('@pos/employees/data-access');

        mockState.employees.loginEmployee = undefined;
        mockState.employees.all = [];
        mockState.employees.initialEmployeeSyncComplete = true;
        mockState.employees.loadingStatus = 'loaded';
        EmployeeService.getLocalEmployees.mockResolvedValueOnce([
            {
                id: 'owner-1',
                code: 'OWNER',
                firstName: 'Casa',
                lastName: 'Martinez',
                middleName: null,
                dob: null,
                phone: null,
                email: 'martinez.casa@yahoo.com',
                pin: '1234',
                roles: ['Admin'],
                active: true,
            },
        ]);

        const navigation = {
            navigate: jest.fn(),
        } as any;

        render(<HomeScreen navigation={navigation} />);

        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'employees/setAll',
                payload: [
                    expect.objectContaining({
                        id: 'owner-1',
                        email: 'martinez.casa@yahoo.com',
                    }),
                ],
            })
        );
    });

    it('shows a confirmation before logging off from the setup wizard', async () => {
        const { isStoreInfoIncomplete } = require('@pos/store-info/data-access');

        mockState.employees.loginEmployee = undefined;
        mockState.employees.all = [];
        mockState.employees.initialEmployeeSyncComplete = true;
        mockState.employees.loadingStatus = 'loaded';
        isStoreInfoIncomplete.mockReturnValue(true);

        const navigation = {
            navigate: jest.fn(),
        } as any;

        const { findByTestId } = render(<HomeScreen navigation={navigation} />);

        const logoffButton = await findByTestId('home-setup-logoff-button');

        await act(async () => {
            fireEvent.press(logoffButton);
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Log off business?',
            'This will sign out the admin session on this device.',
            expect.any(Array)
        );
    });
});
