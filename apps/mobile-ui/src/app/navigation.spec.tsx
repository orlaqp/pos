import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@pos/theme/native';
import Navigation from './navigation';

jest.mock('./HomeScreen', () => ({
    HomeScreen: () => null,
}));

jest.mock('@pos/auth/native-feature', () => ({
    LoginScreen: () => null,
    SignUpScreen: () => null,
    ConfirmSignupScreen: () => null,
}));

jest.mock('@pos/sales/native-feature', () => ({
    SalesScreen: () => null,
}));

jest.mock('@pos/back-office/native-feature', () => ({
    BackOffice: () => null,
}));

jest.mock('@pos/orders/native-feature', () => ({
    Orders: () => null,
    CompactOrderList: () => null,
}));

jest.mock('@pos/orders/data-access', () => ({
    OrderService: {
        buildPrintTicketPreview: jest.fn(() => ({})),
    },
}));

jest.mock('@pos/sales/data-access', () => ({
    cartActions: {
        reset: () => ({ type: 'cart/reset' }),
    },
    selectCart: () => ({ items: [] }),
}));

jest.mock('@pos/printings/data-access', () => ({
    getDefaultPrinter: () => null,
    printReceipt: jest.fn(),
}));

jest.mock('@pos/store-info/data-access', () => ({
    selectStore: () => null,
}));

jest.mock('@pos/employees/data-access', () => ({
    employeesActions: {
        logoffEmployee: () => ({ type: 'employees/logoffEmployee' }),
    },
    selectLoginEmployee: () => null,
}));

jest.mock('@pos/shared/amplify', () => ({
    Auth: { signOut: jest.fn() },
    DataStore: { stop: jest.fn() },
}));

jest.mock('@pos/auth/data-access', () => ({
    authActions: {
        logoff: () => ({ type: 'auth/logoff' }),
    },
    clearCurrentTenantContext: jest.fn(),
    tenantSessionActions: {
        clearTenantSession: () => ({ type: 'tenant/clear' }),
    },
}));

jest.mock('./session-signout', () => ({
    markManualSignOut: jest.fn(),
}));

jest.mock('@pos/shared/utils', () => ({
    translateWithFallback: (_key: string, fallback: string) => fallback,
}));

jest.mock('@pos/store', () => ({
    useAppDispatch: () => jest.fn(),
}));

const mockState = {
    auth: { user: null, error: null, signInStatus: 'not-started' },
    employees: {
        loginEmployee: null,
        all: [],
        initialEmployeeSyncComplete: true,
        loadingStatus: 'loaded',
    },
    settings: { station: { stationNumber: '01' } },
    storeInfo: { store: null, initialStoreSyncComplete: true },
    tenantSession: { businessName: 'Test Business', currentTenantId: 'tenant-1' },
};

jest.mock('react-redux', () => ({
    useSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
    useDispatch: () => jest.fn(),
    Provider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Navigation', () => {
    it('should render successfully', () => {
        const { toJSON } = render(
            <NavigationContainer>
                <ThemeProvider theme={theme('dark')}>
                    <Navigation />
                </ThemeProvider>
            </NavigationContainer>
        );
        expect(toJSON()).toBeTruthy();
    });
});
