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
    Role: {
        Sales: 'Sales',
        Payments: 'Payments',
        Admin: 'Admin',
    },
}));

jest.mock('@pos/employees/data-access', () => ({
    employeesActions: {
        loginEmployee: (payload: unknown) => ({ type: 'employees/loginEmployee', payload }),
    },
    EmployeeService: {
        getEmployee: jest.fn(),
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
    selectInitialStoreSyncComplete: (state: any) => state.storeInfo.initialStoreSyncComplete,
    selectStore: (state: any) => state.storeInfo.store,
    StoreInfoService: {
        save: jest.fn(),
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
        routeGrid: {},
        bigButton: {},
        centered: {},
        routeIconWrap: {},
        routeTitle: {},
    }),
}));

jest.mock('./home-setup-wizard', () => ({
    HomeSetupWizard: () => null,
}));

jest.mock('./home-pin-login', () => ({
    HomePinLogin: () => null,
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
});
