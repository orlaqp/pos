/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render } from '@testing-library/react-native';

const mockUseSelector = jest.fn();
const mockNavigation = { goBack: jest.fn(), replace: jest.fn() };

jest.mock('react-redux', () => ({
  useSelector: (selector: (state?: unknown) => unknown) => {
    mockUseSelector(selector);
    return { firstName: 'Ada', lastName: 'Lovelace' };
  },
}));

jest.mock('@pos/theme/native', () => ({
  useSharedStyles: () => ({
    page: {},
    row: {},
    darkerGrayBackground: {},
    rounded: {},
  }),
}));

jest.mock('@rneui/themed', () => ({
  useTheme: () => ({
    theme: { colors: { background: '#000', grey3: '#333' } },
  }),
  Button: () => null,
}));

jest.mock('react-native-gesture-handler', () => ({
  ScrollView: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
}));

jest.mock('../sidebar/sidebar', () => ({
  __esModule: true,
  default: () => {
    const { Text } = require('react-native');
    return <Text testID="sidebar-stub">Sidebar</Text>;
  },
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => {
      const { View } = require('react-native');
      return <View testID="stack-navigator">{children}</View>;
    },
    Screen: ({ name }: { name: string }) => {
      const { Text } = require('react-native');
      return <Text>{name}</Text>;
    },
  }),
}));

jest.mock('@pos/brands/native-feature', () => ({ Brands: () => null }));
jest.mock('@pos/categories/native-feature', () => ({ Categories: () => null }));
jest.mock('@pos/discounts/native-feature', () => ({
  DiscountEditor: () => null,
  Discounts: () => null,
  PolicyEditor: () => null,
}));
jest.mock('@pos/employees/native-feature', () => ({ Employees: () => null }));
jest.mock('@pos/products/native-feature', () => ({ Products: () => null }));
jest.mock('@pos/unit-of-measures/native-feature', () => ({ UnitOfMeasures: () => null }));
jest.mock('@pos/printings/native-feature', () => ({ PrinterList: () => null }));
jest.mock('@pos/store-info/native-feature', () => ({ StationForm: () => null, StoreInfoForm: () => null }));
jest.mock('@pos/settings/native-feature', () => ({ LogList: () => null, Settings: () => null }));
jest.mock('@pos/inventory/native-feature', () => ({ InventoryCounts: () => null, InventoryList: () => null, InventoryReceives: () => null }));
jest.mock('@pos/reporting/native-feature', () => ({
  CategoryPerformance: () => null,
  Dashboard: () => null,
  DiscountReport: () => null,
  EbtSummary: () => null,
  EndOfDay: () => null,
  HourlySales: () => null,
  LowSalesItems: () => null,
  OpenOrdersAging: () => null,
  PaymentSummary: () => null,
  RefundReport: () => null,
  Sales: () => null,
  SalesByEmployee: () => null,
  SalesByProduct: () => null,
}));
jest.mock('@pos/auth/native-feature', () => ({
  AuthGlyph: () => null,
}));
jest.mock('@pos/employees/data-access', () => ({
  selectLoginEmployee: () => ({ firstName: 'Ada', lastName: 'Lovelace' }),
}));

const { BackOffice } = require('./back-office');

describe('BackOffice', () => {
  it('renders employee name, sidebar and stack screens', () => {
    const { getByText, getByTestId } = render(
      <BackOffice navigation={mockNavigation} />
    );

    expect(getByText('Ada Lovelace')).toBeTruthy();
    expect(getByTestId('sidebar-stub')).toBeTruthy();
    expect(getByTestId('stack-navigator')).toBeTruthy();

    expect(getByText('Dashboard')).toBeTruthy();
    expect(getByText('Sale List')).toBeTruthy();
    expect(getByText('In Stock')).toBeTruthy();
    expect(getByText('Logs')).toBeTruthy();
  });
});
