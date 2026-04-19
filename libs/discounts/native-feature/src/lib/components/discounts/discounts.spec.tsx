import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { DiscountEditor, Discounts, PolicyEditor } from './discounts';

const { Alert } = jest.requireMock('react-native');

const mockListDefinitions = jest.fn();
const mockListPolicies = jest.fn();
const mockGetDefinition = jest.fn();
const mockGetPolicy = jest.fn();
const mockSaveDefinition = jest.fn();
const mockDeleteDefinition = jest.fn();
const mockSavePolicy = jest.fn();
const mockDeletePolicy = jest.fn();
const mockSubscribeDefinitionChanges = jest.fn();
const mockSubscribePolicyChanges = jest.fn();
const mockCategoriesGetAll = jest.fn();
const mockProductsGetAll = jest.fn();
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
    deleteDefinition: (...args: unknown[]) => mockDeleteDefinition(...args),
    savePolicy: (...args: unknown[]) => mockSavePolicy(...args),
    deletePolicy: (...args: unknown[]) => mockDeletePolicy(...args),
    subscribeDefinitionChanges: (...args: unknown[]) => mockSubscribeDefinitionChanges(...args),
    subscribePolicyChanges: (...args: unknown[]) => mockSubscribePolicyChanges(...args),
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

jest.mock('@pos/settings/data-access', () => ({
  StationService: {
    getConfig: (...args: unknown[]) => mockStationGetConfig(...args),
  },
}));

jest.mock('@pos/shared/ui-native', () => {
  const React = require('react');
  const { TextInput, Text, Pressable, View } = require('react-native');
  const { Controller, useFormContext } = require('react-hook-form');

  const UIInput = ({
    name,
    placeholder,
    disabled,
  }: {
    name: string;
    placeholder?: string;
    disabled?: boolean;
  }) => {
    const { control } = useFormContext();
    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }: any) => (
          <TextInput
            testID={`input-${name}`}
            placeholder={placeholder}
            value={value ?? ''}
            editable={!disabled}
            onChangeText={onChange}
          />
        )}
      />
    );
  };

  const UINumericInput = UIInput;
  const UISwitch = ({ name, disabled }: { name: string; disabled?: boolean }) => {
    const { setValue, watch } = useFormContext();
    const value = !!watch(name);
    return (
      <Pressable
        testID={`switch-${name}`}
        disabled={disabled}
        onPress={() => {
          if (!disabled) {
            setValue(name, !value);
          }
        }}
      >
        <Text>{`${value}`}</Text>
      </Pressable>
    );
  };
  const UIOverlaySelect = ({ name, list, selectedId, disabled }: any) => {
    const { setValue } = useFormContext();
    const currentIndex = list.findIndex((item: any) => item.id === selectedId);
    const nextItem = currentIndex >= 0 ? list[(currentIndex + 1) % list.length] : list[0];
    return (
      <Pressable
        testID={`select-${name}`}
        disabled={disabled}
        onPress={() => {
          if (!disabled) {
            setValue(name, nextItem?.id ?? selectedId);
          }
        }}
      >
        <Text>{selectedId || list[0]?.name || 'select'}</Text>
      </Pressable>
    );
  };
  const UIOverlayMultiSelect = ({ name, list, disabled, searchable }: any) => {
    const { setValue } = useFormContext();
    return (
      <Pressable
        testID={`multi-select-${name}`}
        accessibilityHint={searchable ? 'searchable' : 'plain'}
        disabled={disabled}
        onPress={() => {
          if (!disabled) {
            setValue(name, list.slice(0, 2).map((item: any) => item.id));
          }
        }}
      >
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
    mockStationGetConfig.mockResolvedValue({});
    mockSubscribeDefinitionChanges.mockReturnValue({ unsubscribe: jest.fn() });
    mockSubscribePolicyChanges.mockReturnValue({ unsubscribe: jest.fn() });
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

  it('deletes a discount directly from the list', async () => {
    mockListDefinitions
      .mockResolvedValueOnce([
        {
          id: 'disc-1',
          name: 'Summer sale',
          type: 'MANUAL',
          scope: 'LINE',
          method: 'PERCENT',
          active: true,
        },
      ])
      .mockResolvedValueOnce([]);
    mockDeleteDefinition.mockResolvedValueOnce(undefined);

    const { getByTestId, getByText, queryByText } = render(
      <Discounts navigation={navigation} route={{ name: 'Discounts' } as any} />
    );

    await waitFor(() => expect(getByText('Summer sale')).toBeTruthy());
    fireEvent.press(getByTestId('discounts-list-delete-disc-1'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete discount?',
      'Delete "Summer sale" from the backend?',
      expect.any(Array)
    );

    const alertActions = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2] as
      | Array<{ text?: string; onPress?: () => void | Promise<void> }>
      | undefined;
    const deleteAction = alertActions?.find((action) => action.text === 'Delete');
    await act(async () => {
      await deleteAction?.onPress?.();
    });

    await waitFor(() => expect(mockDeleteDefinition).toHaveBeenCalledWith('disc-1'));
    await waitFor(() => expect(queryByText('Summer sale')).toBeNull());
  });

  it('shows automatic discounts in the main discounts list', async () => {
    mockListDefinitions.mockReset();
    mockListDefinitions.mockResolvedValue([
      {
        id: 'disc-auto-1',
        name: 'Happy hour',
        type: 'AUTOMATIC',
        scope: 'LINE',
        method: 'PERCENT',
        active: true,
      },
    ]);

    const { getByText } = render(
      <Discounts navigation={navigation} route={{ name: 'Discounts' } as any} />
    );

    await waitFor(() => expect(getByText('Happy hour')).toBeTruthy());
    expect(mockListDefinitions).toHaveBeenCalledWith(undefined);
  });

  it('updates the definitions list when the shared subscription emits', async () => {
    mockListDefinitions.mockResolvedValue([]);
    let definitionListener: ((items: any[]) => void) | undefined;
    mockSubscribeDefinitionChanges.mockImplementationOnce((listener) => {
      definitionListener = listener;
      return { unsubscribe: jest.fn() };
    });

    const { getByText } = render(
      <Discounts navigation={navigation} route={{ name: 'Discounts' } as any} />
    );

    await waitFor(() => expect(getByText('No discounts yet')).toBeTruthy());

    act(() => {
      definitionListener?.([
        {
          id: 'disc-live-1',
          name: 'Live discount',
          type: 'AUTOMATIC',
          scope: 'ORDER',
          method: 'PERCENT',
          active: true,
        },
      ]);
    });

    await waitFor(() => expect(getByText('Live discount')).toBeTruthy());
  });

  it('renders the discount editor for a new definition without crashing', async () => {
    const screen = render(
      <DiscountEditor navigation={navigation} route={{ name: 'Discount Form', params: undefined } as any} />
    );

    await waitFor(() => {
      expect(screen.getByText('This discount will apply 0% off to the eligible cart lines manually.')).toBeTruthy();
    });
  });

  it('enables search on the product and category multi-select fields', async () => {
    const { getByTestId, getByText } = render(
      <DiscountEditor navigation={navigation} route={{ name: 'Discount Form', params: undefined } as any} />
    );

    await waitFor(() =>
      expect(getByTestId('multi-select-applicableCategoryIds')).toHaveProp(
        'accessibilityHint',
        'searchable'
      )
    );

    await waitFor(() =>
      expect(getByTestId('multi-select-applicableProductIds')).toHaveProp(
        'accessibilityHint',
        'searchable'
      )
    );

    fireEvent.press(getByText('Show advanced rules'));

    await waitFor(() =>
      expect(getByTestId('multi-select-excludedCategoryIds')).toHaveProp(
        'accessibilityHint',
        'searchable'
      )
    );

    await waitFor(() =>
      expect(getByTestId('multi-select-excludedProductIds')).toHaveProp(
        'accessibilityHint',
        'searchable'
      )
    );
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

  it('deletes a policy directly from the list', async () => {
    mockListPolicies
      .mockResolvedValueOnce([
        {
          id: 'policy-1',
          roleKey: 'Sales',
          canApplyOrderDiscount: true,
          active: true,
        },
      ])
      .mockResolvedValueOnce([]);
    mockDeletePolicy.mockResolvedValueOnce(undefined);

    const { getByTestId, getByText, queryByText } = render(
      <Discounts navigation={navigation} route={{ name: 'Policies' } as any} />
    );

    await waitFor(() => expect(getByText('Sales')).toBeTruthy());
    fireEvent.press(getByTestId('discounts-list-delete-policy-1'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete policy?',
      'Delete "Sales" from the backend?',
      expect.any(Array)
    );

    const alertActions = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2] as
      | Array<{ text?: string; onPress?: () => void | Promise<void> }>
      | undefined;
    const deleteAction = alertActions?.find((action) => action.text === 'Delete');
    await act(async () => {
      await deleteAction?.onPress?.();
    });

    await waitFor(() => expect(mockDeletePolicy).toHaveBeenCalledWith('policy-1'));
    await waitFor(() => expect(queryByText('Sales')).toBeNull());
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

    await waitFor(() =>
      expect(mockSaveDefinition).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Manual discount',
          stationIds: null,
        })
      )
    );
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('disables order-ineligible fields when the discount scope is order', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <DiscountEditor navigation={navigation} route={{ name: 'Discount Form', params: {} } as any} />
    );

    await waitFor(() => expect(getByText('Discount Form')).toBeTruthy());
    fireEvent.press(getByTestId('select-scope'));
    fireEvent.press(getByText('Show advanced rules'));

    await waitFor(() => {
      expect(getByTestId('input-minQuantity').props.editable).toBe(false);
      expect(getByTestId('multi-select-applicableCategoryIds').props.disabled).toBe(true);
      expect(getByTestId('multi-select-applicableProductIds').props.disabled).toBe(true);
      expect(getByTestId('multi-select-excludedCategoryIds').props.disabled).toBe(true);
      expect(getByTestId('multi-select-excludedProductIds').props.disabled).toBe(true);
      expect(getByTestId('switch-excludeAlreadyDiscountedItems').props.disabled).toBe(true);
      expect(getByTestId('switch-appliesToAllProducts').props.disabled).toBe(true);
    });

    expect(getByText('Min quantity only applies to line-level discounts.')).toBeTruthy();
    expect(getByText('Product targeting only applies to line-level discounts.')).toBeTruthy();
    expect(
      getByText('Exclusions and "already discounted" rules only apply to line-level discounts.')
    ).toBeTruthy();
    expect(queryByText('This discount will apply 0% off to the eligible cart lines manually.')).toBeNull();
  });

  it('disables applicable targeting filters until line discounts stop applying to all products', async () => {
    const { getByTestId, getByText } = render(
      <DiscountEditor navigation={navigation} route={{ name: 'Discount Form', params: {} } as any} />
    );

    await waitFor(() => expect(getByText('Discount Form')).toBeTruthy());
    expect(getByTestId('multi-select-applicableCategoryIds').props.disabled).toBe(true);
    expect(getByTestId('multi-select-applicableProductIds').props.disabled).toBe(true);
    expect(
      getByText('Turn off "Applies to all products" to target specific products or categories.')
    ).toBeTruthy();

    fireEvent.press(getByTestId('switch-appliesToAllProducts'));

    await waitFor(() => {
      expect(getByTestId('multi-select-applicableCategoryIds').props.disabled).toBe(false);
      expect(getByTestId('multi-select-applicableProductIds').props.disabled).toBe(false);
      expect(getByTestId('switch-appliesToAllProducts').props.disabled).toBe(false);
    });
  });

  it('uses status as the only active control for discount definitions', async () => {
    const { queryByTestId, getByText } = render(
      <DiscountEditor navigation={navigation} route={{ name: 'Discount Form', params: {} } as any} />
    );

    await waitFor(() => expect(getByText('Discount Form')).toBeTruthy());
    expect(queryByTestId('switch-active')).toBeNull();
    expect(queryByTestId('switch-approvalRequired')).toBeNull();
    expect(queryByTestId('switch-reasonRequired')).toBeNull();
    expect(
      getByText('Use Status in the Core section to control whether this discount is active.')
    ).toBeTruthy();
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
      stationIds: ['station-99'],
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
        expect.objectContaining({
          id: 'disc-1',
          name: 'Existing discount',
          stationIds: ['station-99'],
        })
      )
    );
  });

  it('derives active from status and clears unsupported definition approval fields on save', async () => {
    mockSaveDefinition.mockResolvedValueOnce(undefined);

    const { getByPlaceholderText, getByTestId } = render(
      <DiscountEditor navigation={navigation} route={{ name: 'Discount Form', params: {} } as any} />
    );

    fireEvent.changeText(getByPlaceholderText('Name'), 'Inactive discount');
    fireEvent.press(getByTestId('select-status'));
    fireEvent.press(getByTestId('ui-actions-submit'));

    await waitFor(() =>
      expect(mockSaveDefinition).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Inactive discount',
          status: 'INACTIVE',
          active: false,
          approvalRequired: false,
          reasonRequired: false,
        })
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

  it('deletes an existing discount after confirmation', async () => {
    mockGetDefinition.mockResolvedValueOnce({
      id: 'disc-delete-1',
      name: 'Delete me',
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
      stationIds: null,
      excludeAlreadyDiscountedItems: false,
      appliesToAllProducts: true,
      active: true,
    });
    mockDeleteDefinition.mockResolvedValueOnce(undefined);

    const { getByTestId } = render(
      <DiscountEditor
        navigation={navigation}
        route={{ name: 'Discount Form', params: { id: 'disc-delete-1' } } as any}
      />
    );

    await waitFor(() => expect(getByTestId('discount-delete-button')).toBeTruthy());
    fireEvent.press(getByTestId('discount-delete-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete discount?',
      'This will permanently remove the discount definition from the backend.',
      expect.any(Array)
    );

    const alertActions = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2] as
      | Array<{ text?: string; onPress?: () => void | Promise<void> }>
      | undefined;
    const deleteAction = alertActions?.find((action) => action.text === 'Delete');
    await deleteAction?.onPress?.();

    await waitFor(() => expect(mockDeleteDefinition).toHaveBeenCalledWith('disc-delete-1'));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});

describe('PolicyEditor', () => {
  const navigation = { navigate: jest.fn(), goBack: jest.fn() } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCategoriesGetAll.mockResolvedValue([]);
    mockProductsGetAll.mockResolvedValue([]);
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

  it('deletes an existing policy after confirmation', async () => {
    mockGetPolicy.mockResolvedValueOnce({
      id: 'policy-delete-1',
      roleKey: 'Sales',
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
    mockDeletePolicy.mockResolvedValueOnce(undefined);

    const { getByTestId } = render(
      <PolicyEditor
        navigation={navigation}
        route={{ name: 'Policy Form', params: { id: 'policy-delete-1' } } as any}
      />
    );

    await waitFor(() => expect(getByTestId('policy-delete-button')).toBeTruthy());
    fireEvent.press(getByTestId('policy-delete-button'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Delete policy?',
      'This will permanently remove the discount policy from the backend.',
      expect.any(Array)
    );

    const alertActions = (Alert.alert as jest.Mock).mock.calls.at(-1)?.[2] as
      | Array<{ text?: string; onPress?: () => void | Promise<void> }>
      | undefined;
    const deleteAction = alertActions?.find((action) => action.text === 'Delete');
    await deleteAction?.onPress?.();

    await waitFor(() => expect(mockDeletePolicy).toHaveBeenCalledWith('policy-delete-1'));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
