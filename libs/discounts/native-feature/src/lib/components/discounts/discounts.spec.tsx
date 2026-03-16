import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { DiscountEditor, Discounts, PolicyEditor } from './discounts';

const { Alert } = jest.requireMock('react-native');

const mockListDefinitions = jest.fn();
const mockListPolicies = jest.fn();
const mockGetDefinition = jest.fn();
const mockGetPolicy = jest.fn();
const mockSaveDefinition = jest.fn();
const mockSavePolicy = jest.fn();
const mockCategoriesGetAll = jest.fn();
const mockProductsGetAll = jest.fn();
const mockStoreGetAll = jest.fn();
const mockStationGetConfig = jest.fn();

jest.mock('react-native', () => {
  const React = require('react');

  return {
    Alert: { alert: jest.fn() },
    ScrollView: 'ScrollView',
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
    },
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    View: 'View',
    Pressable: 'Pressable',
  };
});

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');

    React.useEffect(() => callback(), [callback]);
  },
}));

jest.mock('@rneui/themed', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    Button: ({ title, onPress, testID }: any) => (
      <Pressable testID={testID} onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

jest.mock('@pos/discounts/data-access', () => ({
  DiscountService: {
    listDefinitions: (...args: unknown[]) => mockListDefinitions(...args),
    listPolicies: (...args: unknown[]) => mockListPolicies(...args),
    getDefinition: (...args: unknown[]) => mockGetDefinition(...args),
    getPolicy: (...args: unknown[]) => mockGetPolicy(...args),
    saveDefinition: (...args: unknown[]) => mockSaveDefinition(...args),
    savePolicy: (...args: unknown[]) => mockSavePolicy(...args),
  },
}));

jest.mock('@pos/categories/data-access', () => ({
  CategoryService: {
    getAll: (...args: unknown[]) => mockCategoriesGetAll(...args),
  },
  CategoryEntityMapper: {
    fromCategory: (item: any) => item,
  },
}));

jest.mock('@pos/products/data-access', () => ({
  ProductService: {
    getAll: (...args: unknown[]) => mockProductsGetAll(...args),
  },
  ProductEntityMapper: {
    fromProduct: (item: any) => item,
  },
}));

jest.mock('@pos/store-info/data-access', () => ({
  StoreInfoService: {
    getStore: (...args: unknown[]) => mockStoreGetAll(...args),
  },
  StoreInfoEntityMapper: {
    fromModel: (item: any) => item,
  },
}));

jest.mock('@pos/settings/data-access', () => ({
  StationService: {
    getConfig: (...args: unknown[]) => mockStationGetConfig(...args),
  },
}));

jest.mock('@pos/shared/ui-native', () => {
  const React = require('react');
  const { TextInput, Text, Pressable, View } = require('react-native');
  const { Controller, useFormContext } = require('react-hook-form');

  const UIInput = ({ name, placeholder }: { name: string; placeholder?: string }) => {
    const { control } = useFormContext();
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }: any) => (
          <TextInput placeholder={placeholder} value={value ?? ''} onChangeText={onChange} />
        )}
      />
    );
  };

  const UINumericInput = UIInput;
  const UISwitch = ({ name }: { name: string }) => {
    const { setValue, watch } = useFormContext();
    const value = !!watch(name);
    return <Pressable testID={`switch-${name}`} onPress={() => setValue(name, !value)}><Text>{`${value}`}</Text></Pressable>;
  };
  const UIOverlaySelect = ({ name, list, selectedId }: any) => {
    const { setValue } = useFormContext();
    return (
      <Pressable testID={`select-${name}`} onPress={() => setValue(name, list[0]?.id ?? selectedId)}>
        <Text>{selectedId || list[0]?.name || 'select'}</Text>
      </Pressable>
    );
  };
  const UIOverlayMultiSelect = ({ name, list }: any) => {
    const { setValue } = useFormContext();
    return (
      <Pressable testID={`multi-select-${name}`} onPress={() => setValue(name, list.slice(0, 2).map((item: any) => item.id))}>
        <Text>multi-select</Text>
      </Pressable>
    );
  };
  const UIDateTimeField = ({ name, placeholder, mode }: any) => {
    const { setValue } = useFormContext();
    return (
      <Pressable
        testID={`date-time-${name}`}
        onPress={() => setValue(name, mode === 'time' ? '08:30' : '2026-03-16T00:00:00.000Z')}
      >
        <Text>{placeholder}</Text>
      </Pressable>
    );
  };

  return {
    UICard: ({ children }: any) => <View>{children}</View>,
    UIActions: ({ submitAction, cancelAction, submitTitle = 'Save', cancelTitle = 'Cancel' }: any) => (
      <View>
        <Pressable testID="ui-actions-submit" onPress={submitAction}><Text>{submitTitle}</Text></Pressable>
        <Pressable testID="ui-actions-cancel" onPress={cancelAction}><Text>{cancelTitle}</Text></Pressable>
      </View>
    ),
    UIInput,
    UINumericInput,
    UIDateTimeField,
    UIOverlayMultiSelect,
    UIOverlaySelect,
    UIScreen: ({ children }: any) => <View>{children}</View>,
    UISwitch,
    UIEmptyState: ({ title, subtitle, actions }: any) => (
      <View>
        <Text>{title}</Text>
        <Text>{subtitle}</Text>
        {actions?.map((action: any) => (
          <Pressable key={action.title} testID={action.testID} onPress={action.onPress}>
            <Text>{action.title}</Text>
          </Pressable>
        ))}
      </View>
    ),
  };
});

jest.mock('@pos/theme/native/design-tokens', () => ({
  useDesignTokens: () => ({
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
    colors: {
      textPrimary: '#fff',
      textSecondary: '#999',
      accent: '#4aa3eb',
      border: '#333',
    },
    radii: { lg: 16 },
  }),
}));

describe('Discounts screen', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoriesGetAll.mockResolvedValue([]);
    mockProductsGetAll.mockResolvedValue([]);
    mockStoreGetAll.mockResolvedValue([]);
    mockStationGetConfig.mockResolvedValue({});
  });

  it('renders empty discounts state with a single CTA', async () => {
    mockListDefinitions.mockResolvedValueOnce([]);

    const { getByText, getByTestId, queryByTestId } = render(
      <Discounts navigation={navigation} route={{ name: 'Discounts' } as any} />
    );

    await waitFor(() => expect(getByText('No discounts yet')).toBeTruthy());
    expect(getByTestId('discounts-empty-add-button')).toBeTruthy();
    expect(queryByTestId('discounts-header-add-button')).toBeNull();
  });

  it('renders discounts list and header action when items exist', async () => {
    mockListDefinitions.mockResolvedValueOnce([
      {
        id: 'disc-1',
        name: 'Summer sale',
        type: 'MANUAL',
        scope: 'LINE',
        method: 'PERCENT',
        active: true,
      },
    ]);

    const { getByText, getByTestId } = render(
      <Discounts navigation={navigation} route={{ name: 'Discounts' } as any} />
    );

    await waitFor(() => expect(getByText('Summer sale')).toBeTruthy());
    expect(getByTestId('discounts-header-add-button')).toBeTruthy();
    fireEvent.press(getByTestId('discounts-list-item-disc-1'));
    expect(navigation.navigate).toHaveBeenCalledWith('Discount Form', { id: 'disc-1' });
  });

  it('renders policies list and navigates to the policy form', async () => {
    mockListPolicies.mockResolvedValueOnce([
      {
        id: 'policy-1',
        roleKey: 'Sales',
        canApplyOrderDiscount: true,
        active: false,
      },
    ]);

    const { getByText, getByTestId } = render(
      <Discounts navigation={navigation} route={{ name: 'Policies' } as any} />
    );

    await waitFor(() => expect(getByText('Sales')).toBeTruthy());
    fireEvent.press(getByTestId('discounts-list-item-policy-1'));
    expect(navigation.navigate).toHaveBeenCalledWith('Policy Form', { id: 'policy-1' });
  });

  it('renders the static exceptions state', () => {
    const { getByText } = render(
      <Discounts navigation={navigation} route={{ name: 'Exceptions' } as any} />
    );

    expect(getByText('EXCEPTIONS')).toBeTruthy();
    expect(getByText('No exceptions')).toBeTruthy();
  });
});

describe('DiscountEditor', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoriesGetAll.mockResolvedValue([
      { id: 'cat-1', name: 'Produce' },
      { id: 'cat-2', name: 'Grocery' },
    ]);
    mockProductsGetAll.mockResolvedValue([
      { id: 'prod-1', name: 'Apple' },
      { id: 'prod-2', name: 'Bread' },
    ]);
    mockStoreGetAll.mockResolvedValue([{ id: 'store-1', name: 'Main Store' }]);
    mockStationGetConfig.mockResolvedValue({ stationNumber: '01' });
  });

  it('saves a new discount and navigates back', async () => {
    mockSaveDefinition.mockResolvedValueOnce(undefined);

    const { getByPlaceholderText, getByTestId } = render(
      <DiscountEditor navigation={navigation} route={{ name: 'Discount Form', params: {} } as any} />
    );

    fireEvent.changeText(getByPlaceholderText('Name'), 'Manual discount');
    fireEvent.changeText(getByPlaceholderText('0'), '10');
    fireEvent.press(getByTestId('ui-actions-submit'));

    await waitFor(() => expect(mockSaveDefinition).toHaveBeenCalled());
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('loads an existing discount and updates it', async () => {
    mockGetDefinition.mockResolvedValueOnce({
      id: 'disc-1',
      name: 'Existing discount',
      code: null,
      description: null,
      status: 'ACTIVE',
      type: 'MANUAL',
      method: 'PERCENT',
      scope: 'LINE',
      value: 10,
      priority: 100,
      stackMode: 'STACKABLE',
      approvalRequired: false,
      reasonRequired: true,
      startDate: null,
      endDate: null,
      daysOfWeek: null,
      startTime: null,
      endTime: null,
      minSubtotal: null,
      minQuantity: null,
      usageLimitTotal: null,
      applicableProductIds: null,
      applicableCategoryIds: null,
      excludedProductIds: null,
      excludedCategoryIds: null,
      storeIds: null,
      stationIds: null,
      excludeAlreadyDiscountedItems: false,
      appliesToAllProducts: true,
      active: true,
    });
    mockSaveDefinition.mockResolvedValueOnce(undefined);

    const { getByDisplayValue, getByTestId } = render(
      <DiscountEditor
        navigation={navigation}
        route={{ name: 'Discount Form', params: { id: 'disc-1' } } as any}
      />
    );

    await waitFor(() => expect(getByDisplayValue('Existing discount')).toBeTruthy());
    fireEvent.press(getByTestId('ui-actions-submit'));

    await waitFor(() =>
      expect(mockSaveDefinition).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'disc-1', name: 'Existing discount' })
      )
    );
  });

  it('alerts when a promo code form is submitted without a code', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <DiscountEditor navigation={navigation} route={{ name: 'Promo Code Form', params: {} } as any} />
    );

    fireEvent.changeText(getByPlaceholderText('Name'), 'Promo only');
    fireEvent.press(getByTestId('ui-actions-submit'));

    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Promo code is required'));
    expect(mockSaveDefinition).not.toHaveBeenCalled();
  });

  it('alerts when the definition is missing during edit load', async () => {
    mockGetDefinition.mockResolvedValueOnce(null);

    render(
      <DiscountEditor
        navigation={navigation}
        route={{ name: 'Discount Form', params: { id: 'missing' } } as any}
      />
    );

    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Discount not found'));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('uses the cancel action to navigate back', async () => {
    const { getByTestId } = render(
      <DiscountEditor navigation={navigation} route={{ name: 'Discount Form', params: {} } as any} />
    );

    fireEvent.press(getByTestId('ui-actions-cancel'));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});

describe('PolicyEditor', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoriesGetAll.mockResolvedValue([]);
    mockProductsGetAll.mockResolvedValue([]);
    mockStoreGetAll.mockResolvedValue([]);
    mockStationGetConfig.mockResolvedValue({});
  });

  it('saves a policy and navigates back', async () => {
    mockSavePolicy.mockResolvedValueOnce(undefined);

    const { getByTestId } = render(
      <PolicyEditor navigation={navigation} route={{ name: 'Policy Form', params: {} } as any} />
    );

    fireEvent.press(getByTestId('ui-actions-submit'));

    await waitFor(() => expect(mockSavePolicy).toHaveBeenCalled());
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('loads an existing policy and updates it', async () => {
    mockGetPolicy.mockResolvedValueOnce({
      id: 'policy-1',
      roleKey: 'Admin',
      employeeId: null,
      maxManualPercentDiscount: 25,
      maxManualAmountDiscount: 15,
      maxPriceOverrideAmount: 10,
      maxPriceOverridePercentBelowBase: 20,
      canApplyOrderDiscount: true,
      canOverridePrice: true,
      canApproveDiscounts: true,
      canApprovePriceOverrides: true,
      canUsePromoCodes: true,
      requireReasonForManualDiscounts: true,
      requireReasonForOverrides: true,
      requireApprovalForOrderDiscount: false,
      requireApprovalForAnyPriceOverride: false,
      allowExclusiveDiscountOverride: false,
      active: true,
    });
    mockSavePolicy.mockResolvedValueOnce(undefined);

    const { getByDisplayValue, getByTestId } = render(
      <PolicyEditor
        navigation={navigation}
        route={{ name: 'Policy Form', params: { id: 'policy-1' } } as any}
      />
    );

    await waitFor(() => expect(getByDisplayValue('25')).toBeTruthy());
    fireEvent.press(getByTestId('ui-actions-submit'));

    await waitFor(() =>
      expect(mockSavePolicy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'policy-1', roleKey: 'Admin' })
      )
    );
  });

  it('alerts when the policy is missing during edit load', async () => {
    mockGetPolicy.mockResolvedValueOnce(null);

    render(
      <PolicyEditor
        navigation={navigation}
        route={{ name: 'Policy Form', params: { id: 'missing' } } as any}
      />
    );

    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Policy not found'));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('uses the cancel action to navigate back', () => {
    const { getByTestId } = render(
      <PolicyEditor navigation={navigation} route={{ name: 'Policy Form', params: {} } as any} />
    );

    fireEvent.press(getByTestId('ui-actions-cancel'));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
