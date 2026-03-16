import React, { useCallback, useMemo, useState } from 'react';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@rneui/themed';
import {
  CategoryService,
  CategoryEntityMapper,
} from '@pos/categories/data-access';
import {
  DiscountDefinitionEntity,
  DiscountService,
  EmployeeDiscountPolicyEntity,
} from '@pos/discounts/data-access';
import {
  ProductEntityMapper,
  ProductService,
} from '@pos/products/data-access';
import {
  UICard,
  UIActions,
  UIDateTimeField,
  UIEmptyState,
  UIInput,
  UINumericInput,
  UIOverlayMultiSelect,
  UIOverlaySelect,
  UIScreen,
  UISwitch,
} from '@pos/shared/ui-native';
import { StationService } from '@pos/settings/data-access';
import { StoreInfoEntityMapper, StoreInfoService } from '@pos/store-info/data-access';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

const definitionTypeOptions = [
  { id: 'MANUAL', name: 'Manual' },
  { id: 'AUTOMATIC', name: 'Automatic' },
  { id: 'PROMO_CODE', name: 'Promo code' },
];

const statusOptions = [
  { id: 'DRAFT', name: 'Draft' },
  { id: 'ACTIVE', name: 'Active' },
  { id: 'INACTIVE', name: 'Inactive' },
  { id: 'EXPIRED', name: 'Expired' },
];

const methodOptions = [
  { id: 'PERCENT', name: 'Percent' },
  { id: 'AMOUNT', name: 'Amount' },
  { id: 'FINAL_PRICE', name: 'Final price' },
];

const scopeOptions = [
  { id: 'LINE', name: 'Line' },
  { id: 'ORDER', name: 'Order' },
];

const stackModeOptions = [
  { id: 'STACKABLE', name: 'Stackable' },
  { id: 'EXCLUSIVE', name: 'Exclusive' },
  { id: 'BEST_PRICE_ONLY', name: 'Best price only' },
];

const roleOptions = [
  { id: 'Admin', name: 'Admin' },
  { id: 'Sales', name: 'Sales' },
  { id: 'Payments', name: 'Payments' },
];

const dayOfWeekOptions = [
  { id: 'MONDAY', name: 'Monday' },
  { id: 'TUESDAY', name: 'Tuesday' },
  { id: 'WEDNESDAY', name: 'Wednesday' },
  { id: 'THURSDAY', name: 'Thursday' },
  { id: 'FRIDAY', name: 'Friday' },
  { id: 'SATURDAY', name: 'Saturday' },
  { id: 'SUNDAY', name: 'Sunday' },
];

const sectionConfig = {
  Discounts: {
    title: 'Discount definitions',
    description:
      'Manual and automatic discounts used by the pricing engine and stored on orders as applied snapshots.',
    actionLabel: 'Add discount',
    createRoute: 'Discount Form',
    type: 'definition' as const,
    filter: 'MANUAL' as const,
  },
  'Promo Codes': {
    title: 'Promo codes',
    description:
      'Code-based discounts that can work offline and reconcile later if usage limits drift.',
    actionLabel: 'Add promo code',
    createRoute: 'Promo Code Form',
    type: 'definition' as const,
    filter: 'PROMO_CODE' as const,
  },
  Policies: {
    title: 'Discount policies',
    description:
      'Employee and role thresholds for manual discounts, overrides, and approvals.',
    actionLabel: 'Add policy',
    createRoute: 'Policy Form',
    type: 'policy' as const,
  },
  Exceptions: {
    title: 'No exceptions',
    description:
      'Offline reconciliation exceptions will appear here when synced pricing needs review.',
    actionLabel: '',
    createRoute: '',
    type: 'static' as const,
  },
} as const;

type DiscountScreenName = keyof typeof sectionConfig;
type NavigationShape = NativeStackNavigationProp<Record<string, object | undefined>>;
type RouteShape = RouteProp<Record<string, object | undefined>, string>;

interface DiscountsProps {
  navigation: NavigationShape;
  route: RouteShape;
}

interface DefinitionFormValues {
  name: string;
  code: string;
  description: string;
  status: string;
  type: string;
  method: string;
  scope: string;
  value: string;
  priority: string;
  stackMode: string;
  approvalRequired: boolean;
  reasonRequired: boolean;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  minSubtotal: string;
  minQuantity: string;
  usageLimitTotal: string;
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  excludedProductIds: string[];
  excludedCategoryIds: string[];
  storeIds: string[];
  stationIds: string[];
  excludeAlreadyDiscountedItems: boolean;
  appliesToAllProducts: boolean;
  active: boolean;
}

interface PolicyFormValues {
  roleKey: string;
  employeeId: string;
  maxManualPercentDiscount: string;
  maxManualAmountDiscount: string;
  maxPriceOverrideAmount: string;
  maxPriceOverridePercentBelowBase: string;
  canApplyOrderDiscount: boolean;
  canOverridePrice: boolean;
  canApproveDiscounts: boolean;
  canApprovePriceOverrides: boolean;
  canUsePromoCodes: boolean;
  requireReasonForManualDiscounts: boolean;
  requireReasonForOverrides: boolean;
  requireApprovalForOrderDiscount: boolean;
  requireApprovalForAnyPriceOverride: boolean;
  allowExclusiveDiscountOverride: boolean;
  active: boolean;
}

const defaultDefinitionValues = (promoMode: boolean): DefinitionFormValues => ({
  name: '',
  code: '',
  description: '',
  status: 'ACTIVE',
  type: promoMode ? 'PROMO_CODE' : 'MANUAL',
  method: 'PERCENT',
  scope: 'LINE',
  value: '0',
  priority: '100',
  stackMode: 'STACKABLE',
  approvalRequired: false,
  reasonRequired: true,
  startDate: '',
  endDate: '',
  daysOfWeek: [],
  startTime: '',
  endTime: '',
  minSubtotal: '',
  minQuantity: '',
  usageLimitTotal: '',
  applicableProductIds: [],
  applicableCategoryIds: [],
  excludedProductIds: [],
  excludedCategoryIds: [],
  storeIds: [],
  stationIds: [],
  excludeAlreadyDiscountedItems: false,
  appliesToAllProducts: true,
  active: true,
});

const defaultPolicyValues: PolicyFormValues = {
  roleKey: 'Sales',
  employeeId: '',
  maxManualPercentDiscount: '10',
  maxManualAmountDiscount: '10',
  maxPriceOverrideAmount: '10',
  maxPriceOverridePercentBelowBase: '15',
  canApplyOrderDiscount: false,
  canOverridePrice: true,
  canApproveDiscounts: false,
  canApprovePriceOverrides: false,
  canUsePromoCodes: true,
  requireReasonForManualDiscounts: true,
  requireReasonForOverrides: true,
  requireApprovalForOrderDiscount: false,
  requireApprovalForAnyPriceOverride: false,
  allowExclusiveDiscountOverride: false,
  active: true,
};

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredNumber(value: string, fallback = 0): number {
  const parsed = parseOptionalNumber(value);
  return parsed == null ? fallback : parsed;
}

function parseStringList(value: string): string[] | null {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : null;
}

function toCsv(values?: string[] | null): string {
  return values?.join(', ') || '';
}

function mapDefinitionToForm(entity: DiscountDefinitionEntity, promoMode: boolean): DefinitionFormValues {
  return {
    name: entity.name,
    code: entity.code || '',
    description: entity.description || '',
    status: entity.status,
    type: promoMode ? 'PROMO_CODE' : entity.type,
    method: entity.method,
    scope: entity.scope,
    value: String(entity.value ?? 0),
    priority: entity.priority == null ? '100' : String(entity.priority),
    stackMode: entity.stackMode,
    approvalRequired: entity.approvalRequired ?? false,
    reasonRequired: entity.reasonRequired ?? false,
    startDate: entity.startDate || '',
    endDate: entity.endDate || '',
    daysOfWeek: entity.daysOfWeek?.filter((item): item is string => !!item) || [],
    startTime: entity.startTime || '',
    endTime: entity.endTime || '',
    minSubtotal: entity.minSubtotal == null ? '' : String(entity.minSubtotal),
    minQuantity: entity.minQuantity == null ? '' : String(entity.minQuantity),
    usageLimitTotal: entity.usageLimitTotal == null ? '' : String(entity.usageLimitTotal),
    applicableProductIds: entity.applicableProductIds?.filter((item): item is string => !!item) || [],
    applicableCategoryIds: entity.applicableCategoryIds?.filter((item): item is string => !!item) || [],
    excludedProductIds: entity.excludedProductIds?.filter((item): item is string => !!item) || [],
    excludedCategoryIds: entity.excludedCategoryIds?.filter((item): item is string => !!item) || [],
    storeIds: entity.storeIds?.filter((item): item is string => !!item) || [],
    stationIds: entity.stationIds?.filter((item): item is string => !!item) || [],
    excludeAlreadyDiscountedItems: entity.excludeAlreadyDiscountedItems ?? false,
    appliesToAllProducts: entity.appliesToAllProducts ?? true,
    active: entity.active,
  };
}

function mapPolicyToForm(entity: EmployeeDiscountPolicyEntity): PolicyFormValues {
  return {
    roleKey: entity.roleKey || 'Sales',
    employeeId: entity.employeeId || '',
    maxManualPercentDiscount:
      entity.maxManualPercentDiscount == null ? '' : String(entity.maxManualPercentDiscount),
    maxManualAmountDiscount:
      entity.maxManualAmountDiscount == null ? '' : String(entity.maxManualAmountDiscount),
    maxPriceOverrideAmount:
      entity.maxPriceOverrideAmount == null ? '' : String(entity.maxPriceOverrideAmount),
    maxPriceOverridePercentBelowBase:
      entity.maxPriceOverridePercentBelowBase == null
        ? ''
        : String(entity.maxPriceOverridePercentBelowBase),
    canApplyOrderDiscount: entity.canApplyOrderDiscount ?? false,
    canOverridePrice: entity.canOverridePrice ?? false,
    canApproveDiscounts: entity.canApproveDiscounts ?? false,
    canApprovePriceOverrides: entity.canApprovePriceOverrides ?? false,
    canUsePromoCodes: entity.canUsePromoCodes ?? false,
    requireReasonForManualDiscounts: entity.requireReasonForManualDiscounts ?? false,
    requireReasonForOverrides: entity.requireReasonForOverrides ?? false,
    requireApprovalForOrderDiscount: entity.requireApprovalForOrderDiscount ?? false,
    requireApprovalForAnyPriceOverride: entity.requireApprovalForAnyPriceOverride ?? false,
    allowExclusiveDiscountOverride: entity.allowExclusiveDiscountOverride ?? false,
    active: entity.active,
  };
}

function buildDefinitionEntity(
  values: DefinitionFormValues,
  existingId: string | undefined,
  promoMode: boolean
): DiscountDefinitionEntity {
  return {
    id: existingId,
    name: values.name.trim(),
    code: promoMode ? values.code.trim().toUpperCase() || null : values.code.trim() || null,
    description: values.description.trim() || null,
    status: values.status,
    type: promoMode ? 'PROMO_CODE' : values.type,
    method: values.method,
    scope: values.scope,
    value: parseRequiredNumber(values.value),
    priority: parseOptionalNumber(values.priority),
    stackMode: values.stackMode,
    approvalRequired: values.approvalRequired,
    reasonRequired: values.reasonRequired,
    startDate: values.startDate.trim() || null,
    endDate: values.endDate.trim() || null,
    daysOfWeek: values.daysOfWeek.length ? values.daysOfWeek : null,
    startTime: values.startTime.trim() || null,
    endTime: values.endTime.trim() || null,
    minSubtotal: parseOptionalNumber(values.minSubtotal),
    minQuantity: parseOptionalNumber(values.minQuantity),
    usageLimitTotal: parseOptionalNumber(values.usageLimitTotal),
    applicableProductIds: values.applicableProductIds.length ? values.applicableProductIds : null,
    applicableCategoryIds: values.applicableCategoryIds.length ? values.applicableCategoryIds : null,
    excludedProductIds: values.excludedProductIds.length ? values.excludedProductIds : null,
    excludedCategoryIds: values.excludedCategoryIds.length ? values.excludedCategoryIds : null,
    storeIds: values.storeIds.length ? values.storeIds : null,
    stationIds: values.stationIds.length ? values.stationIds : null,
    excludeAlreadyDiscountedItems: values.excludeAlreadyDiscountedItems,
    appliesToAllProducts: values.appliesToAllProducts,
    active: values.active,
  };
}

function buildPolicyEntity(values: PolicyFormValues, existingId: string | undefined): EmployeeDiscountPolicyEntity {
  return {
    id: existingId,
    roleKey: values.roleKey || null,
    employeeId: values.employeeId.trim() || null,
    maxManualPercentDiscount: parseOptionalNumber(values.maxManualPercentDiscount),
    maxManualAmountDiscount: parseOptionalNumber(values.maxManualAmountDiscount),
    maxPriceOverrideAmount: parseOptionalNumber(values.maxPriceOverrideAmount),
    maxPriceOverridePercentBelowBase: parseOptionalNumber(values.maxPriceOverridePercentBelowBase),
    canApplyOrderDiscount: values.canApplyOrderDiscount,
    canOverridePrice: values.canOverridePrice,
    canApproveDiscounts: values.canApproveDiscounts,
    canApprovePriceOverrides: values.canApprovePriceOverrides,
    canUsePromoCodes: values.canUsePromoCodes,
    requireReasonForManualDiscounts: values.requireReasonForManualDiscounts,
    requireReasonForOverrides: values.requireReasonForOverrides,
    requireApprovalForOrderDiscount: values.requireApprovalForOrderDiscount,
    requireApprovalForAnyPriceOverride: values.requireApprovalForAnyPriceOverride,
    allowExclusiveDiscountOverride: values.allowExclusiveDiscountOverride,
    active: values.active,
  };
}

export function Discounts({ navigation, route }: DiscountsProps) {
  const key = (route.name in sectionConfig ? route.name : 'Discounts') as DiscountScreenName;
  const config = sectionConfig[key];
  const definitionFilter = config.type === 'definition' ? config.filter : undefined;
  const tokens = useDesignTokens();
  const styles = useStyles(tokens);
  const [definitions, setDefinitions] = useState<DiscountDefinitionEntity[]>([]);
  const [policies, setPolicies] = useState<EmployeeDiscountPolicyEntity[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (config.type === 'definition') {
        const items = await DiscountService.listDefinitions(definitionFilter);
        setDefinitions(items);
      } else if (config.type === 'policy') {
        const items = await DiscountService.listPolicies();
        setPolicies(items);
      }
    } finally {
      setLoading(false);
    }
  }, [config.type, definitionFilter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (config.type === 'static') {
    return (
      <View style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{key.toUpperCase()}</Text>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.description}>{config.description}</Text>
        </View>
      </View>
    );
  }

  const empty = config.type === 'definition' ? definitions.length === 0 : policies.length === 0;

  return (
    <UIScreen>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <UICard tone="muted" radius="lg" style={styles.headerCard}>
              <View style={styles.headerRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.headerTitle}>{config.title}</Text>
                  <Text style={styles.headerSubtitle}>{config.description}</Text>
                </View>
                {config.actionLabel && !empty ? (
                  <Button
                    testID="discounts-header-add-button"
                    title={config.actionLabel}
                    onPress={() => navigation.navigate(config.createRoute as never)}
                    buttonStyle={styles.headerButton}
                    titleStyle={styles.headerButtonTitle}
                    containerStyle={styles.headerButtonContainer}
                  />
                ) : null}
              </View>
            </UICard>

            {empty ? (
              <UICard style={styles.emptyCard}>
                <UIEmptyState
                  title={loading ? 'Loading…' : `No ${key.toLowerCase()} yet`}
                  subtitle={config.description}
                  actions={
                    config.actionLabel
                      ? [
                          {
                            title: config.actionLabel,
                            testID: 'discounts-empty-add-button',
                            onPress: () => navigation.navigate(config.createRoute as never),
                            type: 'solid',
                          },
                        ]
                      : undefined
                  }
                />
              </UICard>
            ) : (
              <View style={styles.listWrap}>
                {(config.type === 'definition' ? definitions : policies).map((item) => {
                  const id = item.id || `${item.roleKey || item.employeeId || item.name}`;
                  const navigateParams = item.id ? { id: item.id } : undefined;

                  return (
                    <TouchableOpacity
                      key={id}
                      testID={`discounts-list-item-${id}`}
                      activeOpacity={0.86}
                      onPress={() =>
                        config.createRoute
                          ? (navigation.navigate as any)(config.createRoute, navigateParams)
                          : undefined
                      }
                    >
                      <UICard style={styles.listCard}>
                        <View style={styles.listRow}>
                          <View style={styles.listCopy}>
                            <Text style={styles.listTitle}>
                              {'name' in item ? item.name : item.roleKey || item.employeeId || 'Policy'}
                            </Text>
                            <Text style={styles.listMeta}>
                              {'type' in item
                                ? `${item.type} • ${item.scope} • ${item.method}`
                                : `Role ${item.roleKey || 'custom'} • order ${item.canApplyOrderDiscount ? 'allowed' : 'blocked'}`}
                            </Text>
                          </View>
                          <View style={styles.listAside}>
                            {'active' in item && !item.active ? (
                              <View style={styles.inactivePill}>
                                <Text style={styles.inactivePillText}>Inactive</Text>
                              </View>
                            ) : null}
                            <Text style={styles.editHint}>Edit</Text>
                          </View>
                        </View>
                      </UICard>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </UIScreen>
  );
}

interface DiscountEditorProps {
  navigation: NavigationShape;
  route: RouteShape;
}

export function DiscountEditor({ navigation, route }: DiscountEditorProps) {
  const promoMode = route.name === 'Promo Code Form';
  const editingId = (route.params as { id?: string } | undefined)?.id;
  const tokens = useDesignTokens();
  const styles = useStyles(tokens);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(editingId));
  const [categoryOptions, setCategoryOptions] = useState<{ id?: string; name: string }[]>([]);
  const [productOptions, setProductOptions] = useState<{ id?: string; name: string }[]>([]);
  const [storeOptions, setStoreOptions] = useState<{ id?: string; name: string }[]>([]);
  const [stationOptions, setStationOptions] = useState<{ id?: string; name: string }[]>([]);

  const form = useForm<DefinitionFormValues>({
    mode: 'onChange',
    defaultValues: defaultDefinitionValues(promoMode),
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        const [categories, products, stores, stationConfig] = await Promise.all([
          CategoryService.getAll(),
          ProductService.getAll(),
          StoreInfoService.getStore(),
          StationService.getConfig(),
        ]);

        if (!active) return;

        setCategoryOptions(
          categories
            .map((item) => CategoryEntityMapper.fromCategory(item))
            .map((item) => ({ id: item.id, name: item.name }))
        );
        setProductOptions(
          products
            .map((item) => ProductEntityMapper.fromProduct(item))
            .map((item) => ({ id: item.id, name: item.name }))
        );
        setStoreOptions(
          stores
            .map((item) => StoreInfoEntityMapper.fromModel(item))
            .map((item) => ({ id: item.id, name: item.name }))
        );
        setStationOptions(
          stationConfig.stationNumber
            ? [
                {
                  id: stationConfig.stationNumber,
                  name: `Station ${stationConfig.stationNumber}`,
                },
              ]
            : []
        );

        const currentStoreId = stores[0]?.id;
        const currentStationId = stationConfig.stationNumber;

        if (!editingId) {
          form.reset({
            ...defaultDefinitionValues(promoMode),
            storeIds: currentStoreId ? [currentStoreId] : [],
            stationIds: currentStationId ? [currentStationId] : [],
          });
          setLoading(false);
          return;
        }

        setLoading(true);
        const definition = await DiscountService.getDefinition(editingId);
        if (!active) return;

        if (!definition) {
          Alert.alert('Discount not found');
          navigation.goBack();
          return;
        }

        const mapped = mapDefinitionToForm(definition, promoMode);
        form.reset({
          ...mapped,
          storeIds: currentStoreId ? [currentStoreId] : mapped.storeIds,
          stationIds: currentStationId
            ? mapped.stationIds.length
              ? mapped.stationIds.filter((item) => item === currentStationId)
              : [currentStationId]
            : mapped.stationIds,
        });
        setLoading(false);
      };

      load();
      return () => {
        active = false;
      };
    }, [editingId, form, navigation, promoMode])
  );

  const title = editingId ? (promoMode ? 'Edit Promo Code' : 'Edit Discount') : promoMode ? 'Promo Code Form' : 'Discount Form';

  const save = async (values: DefinitionFormValues) => {
    setBusy(true);
    try {
      if (promoMode && !values.code.trim()) {
        Alert.alert('Promo code is required');
        return;
      }
      if (!values.name.trim()) {
        Alert.alert('Name is required');
        return;
      }

      await DiscountService.saveDefinition(buildDefinitionEntity(values, editingId, promoMode));
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  const definitionTypeList = useMemo(
    () => (promoMode ? [definitionTypeOptions[2]] : definitionTypeOptions.slice(0, 2)),
    [promoMode]
  );
  const methodList = useMemo(
    () => (promoMode ? methodOptions.slice(0, 2) : methodOptions),
    [promoMode]
  );

  return (
    <UIScreen>
      <FormProvider {...form}>
        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
              <UICard tone="muted" radius="lg" style={styles.headerCard}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>
                  {promoMode
                    ? 'Create or edit a code-based discount definition.'
                    : 'Create or edit a manual or automatic discount definition.'}
                </Text>
              </UICard>

              {loading ? (
                <UICard style={styles.emptyCard}>
                  <Text style={styles.headerTitle}>Loading definition…</Text>
                </UICard>
              ) : (
                <>
                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Core</Text>
                    <UIInput name="name" label="Name" placeholder="Name" rules={{ required: 'Name is required' }} />
                    <UIInput name="description" label="Description" placeholder="Description" />
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Type</Text>
                        <UIOverlaySelect name="type" title="Select type" list={definitionTypeList} selectedId={form.watch('type')} />
                      </View>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Status</Text>
                        <UIOverlaySelect name="status" title="Select status" list={statusOptions} selectedId={form.watch('status')} />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Scope</Text>
                        <UIOverlaySelect name="scope" title="Select scope" list={scopeOptions} selectedId={form.watch('scope')} />
                      </View>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Method</Text>
                        <UIOverlaySelect name="method" title="Select method" list={methodList} selectedId={form.watch('method')} />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Stack mode</Text>
                        <UIOverlaySelect name="stackMode" title="Select stack mode" list={stackModeOptions} selectedId={form.watch('stackMode')} />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput name="priority" label="Priority" keyboardType="number-pad" placeholder="100" />
                      </View>
                    </View>
                    {promoMode ? (
                      <UIInput name="code" label="Promo code" placeholder="SPRING10" rules={{ required: 'Promo code is required' }} />
                    ) : null}
                    <UINumericInput name="value" label="Value" allowDecimals keyboardType="decimal-pad" placeholder="0" />
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Schedule and thresholds</Text>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="startDate"
                          label="Start date"
                          placeholder="Select start date"
                          mode="date"
                          title="Select start date"
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="endDate"
                          label="End date"
                          placeholder="Select end date"
                          mode="date"
                          title="Select end date"
                        />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="startTime"
                          label="Start time"
                          placeholder="Select start time"
                          mode="time"
                          title="Select start time"
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <UIDateTimeField
                          name="endTime"
                          label="End time"
                          placeholder="Select end time"
                          mode="time"
                          title="Select end time"
                        />
                      </View>
                    </View>
                    <View style={styles.formColumnWide}>
                      <Text style={styles.fieldLabel}>Days of week</Text>
                      <UIOverlayMultiSelect
                        name="daysOfWeek"
                        title="Select days of week"
                        emptyLabel="Choose days"
                        list={dayOfWeekOptions}
                      />
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UINumericInput name="minSubtotal" label="Min subtotal" allowDecimals keyboardType="decimal-pad" placeholder="Optional" />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput name="minQuantity" label="Min quantity" allowDecimals keyboardType="decimal-pad" placeholder="Optional" />
                      </View>
                    </View>
                    {promoMode ? (
                      <UINumericInput name="usageLimitTotal" label="Usage limit" keyboardType="number-pad" placeholder="Optional" />
                    ) : null}
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Eligibility</Text>
                    <View style={styles.formColumnWide}>
                      <Text style={styles.fieldLabel}>Applicable categories</Text>
                      <UIOverlayMultiSelect
                        name="applicableCategoryIds"
                        title="Select applicable categories"
                        emptyLabel="Choose categories"
                        list={categoryOptions}
                      />
                    </View>
                    <View style={styles.formColumnWide}>
                      <Text style={styles.fieldLabel}>Applicable products</Text>
                      <UIOverlayMultiSelect
                        name="applicableProductIds"
                        title="Select applicable products"
                        emptyLabel="Choose products"
                        list={productOptions}
                      />
                    </View>
                    <View style={styles.formColumnWide}>
                      <Text style={styles.fieldLabel}>Excluded categories</Text>
                      <UIOverlayMultiSelect
                        name="excludedCategoryIds"
                        title="Select excluded categories"
                        emptyLabel="Choose categories"
                        list={categoryOptions}
                      />
                    </View>
                    <View style={styles.formColumnWide}>
                      <Text style={styles.fieldLabel}>Excluded products</Text>
                      <UIOverlayMultiSelect
                        name="excludedProductIds"
                        title="Select excluded products"
                        emptyLabel="Choose products"
                        list={productOptions}
                      />
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Stores</Text>
                        <UIOverlayMultiSelect
                          name="storeIds"
                          title="Select stores"
                          emptyLabel="Choose stores"
                          list={storeOptions}
                          disabled
                        />
                      </View>
                      <View style={styles.formColumn}>
                        <Text style={styles.fieldLabel}>Stations</Text>
                        <UIOverlayMultiSelect
                          name="stationIds"
                          title="Select stations"
                          emptyLabel="Choose stations"
                          list={stationOptions}
                        />
                      </View>
                    </View>
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Rules</Text>
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Active</Text>
                      <UISwitch name="active" />
                    </View>
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Approval required</Text>
                      <UISwitch name="approvalRequired" />
                    </View>
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Reason required</Text>
                      <UISwitch name="reasonRequired" />
                    </View>
                    <View style={styles.toggleRow}>
                      <Text style={styles.toggleLabel}>Exclude already discounted items</Text>
                      <UISwitch name="excludeAlreadyDiscountedItems" />
                    </View>
                    <View style={styles.toggleRowNoBorder}>
                      <Text style={styles.toggleLabel}>Applies to all products</Text>
                      <UISwitch name="appliesToAllProducts" />
                    </View>
                  </UICard>
                </>
              )}
            </View>
          </ScrollView>
          <View style={styles.actionBar}>
            <UICard tone="muted" style={styles.actionBarCard}>
              <UIActions
                busy={busy || loading}
                submitTitle={editingId ? 'Update' : 'Save'}
                submitAction={form.handleSubmit(save)}
                cancelAction={() => navigation.goBack()}
              />
            </UICard>
          </View>
        </View>
      </FormProvider>
    </UIScreen>
  );
}

export function PolicyEditor({ navigation, route }: DiscountEditorProps) {
  const editingId = (route.params as { id?: string } | undefined)?.id;
  const tokens = useDesignTokens();
  const styles = useStyles(tokens);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(editingId));
  const form = useForm<PolicyFormValues>({
    mode: 'onChange',
    defaultValues: defaultPolicyValues,
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        if (!editingId) {
          form.reset(defaultPolicyValues);
          setLoading(false);
          return;
        }

        setLoading(true);
        const policy = await DiscountService.getPolicy(editingId);
        if (!active) return;

        if (!policy) {
          Alert.alert('Policy not found');
          navigation.goBack();
          return;
        }

        form.reset(mapPolicyToForm(policy));
        setLoading(false);
      };

      load();
      return () => {
        active = false;
      };
    }, [editingId, form, navigation])
  );

  const save = async (values: PolicyFormValues) => {
    setBusy(true);
    try {
      await DiscountService.savePolicy(buildPolicyEntity(values, editingId));
      navigation.goBack();
    } finally {
      setBusy(false);
    }
  };

  return (
    <UIScreen>
      <FormProvider {...form}>
        <View style={styles.screen}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.container}>
              <UICard tone="muted" radius="lg" style={styles.headerCard}>
                <Text style={styles.headerTitle}>{editingId ? 'Edit Policy' : 'Policy Form'}</Text>
                <Text style={styles.headerSubtitle}>
                  Create or edit a role or employee policy for manual discounts, overrides, and approvals.
                </Text>
              </UICard>

              {loading ? (
                <UICard style={styles.emptyCard}>
                  <Text style={styles.headerTitle}>Loading policy…</Text>
                </UICard>
              ) : (
                <>
                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Target</Text>
                    <Text style={styles.fieldLabel}>Role</Text>
                    <UIOverlaySelect name="roleKey" title="Select role" list={roleOptions} selectedId={form.watch('roleKey')} />
                    <UIInput name="employeeId" label="Employee ID (optional)" placeholder="Optional employee override" />
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Thresholds</Text>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UINumericInput name="maxManualPercentDiscount" label="Max manual %" keyboardType="decimal-pad" allowDecimals placeholder="0" />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput name="maxManualAmountDiscount" label="Max manual amount" keyboardType="decimal-pad" allowDecimals placeholder="0" />
                      </View>
                    </View>
                    <View style={styles.formGrid}>
                      <View style={styles.formColumn}>
                        <UINumericInput name="maxPriceOverrideAmount" label="Max override amount" keyboardType="decimal-pad" allowDecimals placeholder="0" />
                      </View>
                      <View style={styles.formColumn}>
                        <UINumericInput name="maxPriceOverridePercentBelowBase" label="Max override below base %" keyboardType="decimal-pad" allowDecimals placeholder="0" />
                      </View>
                    </View>
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Capabilities</Text>
                    {[
                      ['canApplyOrderDiscount', 'Can apply order discounts'],
                      ['canOverridePrice', 'Can override price'],
                      ['canApproveDiscounts', 'Can approve discounts'],
                      ['canApprovePriceOverrides', 'Can approve overrides'],
                      ['canUsePromoCodes', 'Can use promo codes'],
                      ['requireReasonForManualDiscounts', 'Require reason for manual discounts'],
                      ['requireReasonForOverrides', 'Require reason for overrides'],
                      ['requireApprovalForOrderDiscount', 'Require approval for order discounts'],
                      ['requireApprovalForAnyPriceOverride', 'Require approval for any override'],
                      ['allowExclusiveDiscountOverride', 'Allow exclusive discount override'],
                      ['active', 'Active'],
                    ].map(([name, label], index, items) => (
                      <View key={name} style={index === items.length - 1 ? styles.toggleRowNoBorder : styles.toggleRow}>
                        <Text style={styles.toggleLabel}>{label}</Text>
                        <UISwitch name={name} />
                      </View>
                    ))}
                  </UICard>
                </>
              )}
            </View>
          </ScrollView>
          <View style={styles.actionBar}>
            <UICard tone="muted" style={styles.actionBarCard}>
              <UIActions
                busy={busy || loading}
                submitTitle={editingId ? 'Update' : 'Save'}
                submitAction={form.handleSubmit(save)}
                cancelAction={() => navigation.goBack()}
              />
            </UICard>
          </View>
        </View>
      </FormProvider>
    </UIScreen>
  );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
  StyleSheet.create({
    page: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: '#000000',
    },
    card: {
      width: '100%',
      maxWidth: 680,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#1f2937',
      backgroundColor: '#0f131b',
      paddingHorizontal: 28,
      paddingVertical: 32,
    },
    eyebrow: {
      color: '#60a5fa',
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1.6,
      marginBottom: 12,
    },
    title: {
      color: '#ffffff',
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 12,
    },
    description: {
      color: '#9ca3af',
      fontSize: 16,
      lineHeight: 24,
    },
    screen: { flex: 1 },
    scrollContent: {
      paddingHorizontal: tokens.spacing.xl,
      paddingTop: tokens.spacing.lg,
      paddingBottom: tokens.spacing.xl,
      alignItems: 'center',
    },
    container: { width: '100%', maxWidth: 980 },
    headerCard: { marginBottom: tokens.spacing.lg },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: tokens.spacing.md },
    headerCopy: { flex: 1 },
    headerTitle: { color: tokens.colors.textPrimary, fontSize: 26, fontWeight: '700' },
    headerSubtitle: { color: tokens.colors.textSecondary, marginTop: tokens.spacing.xs, fontSize: 15 },
    headerButtonContainer: { alignSelf: 'flex-start' },
    headerButton: { minHeight: 48, borderRadius: 14, paddingHorizontal: 16, backgroundColor: tokens.colors.accent },
    headerButtonTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
    emptyCard: { padding: tokens.spacing.lg, minHeight: 240 },
    listWrap: { gap: tokens.spacing.sm },
    listCard: { paddingVertical: tokens.spacing.sm },
    listRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    listCopy: { flex: 1, paddingRight: tokens.spacing.md },
    listAside: { alignItems: 'flex-end', gap: tokens.spacing.xs },
    listTitle: { color: tokens.colors.textPrimary, fontSize: 18, fontWeight: '700' },
    listMeta: { color: tokens.colors.textSecondary, fontSize: 14, marginTop: 4 },
    editHint: { color: tokens.colors.accent, fontSize: 13, fontWeight: '700' },
    inactivePill: { borderRadius: 999, backgroundColor: '#3f1d1d', paddingHorizontal: 10, paddingVertical: 6 },
    inactivePillText: { color: '#fca5a5', fontSize: 12, fontWeight: '800' },
    sectionCard: { marginBottom: tokens.spacing.lg },
    sectionTitle: { color: tokens.colors.textPrimary, fontSize: 19, fontWeight: '700', marginBottom: tokens.spacing.sm },
    fieldLabel: { color: tokens.colors.textSecondary, fontSize: 13, fontWeight: '700', marginTop: tokens.spacing.xs },
    formGrid: { flexDirection: 'row', gap: tokens.spacing.md },
    formColumn: { flex: 1 },
    formColumnWide: { width: '100%' },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: tokens.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: tokens.colors.border,
    },
    toggleRowNoBorder: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: tokens.spacing.sm,
    },
    toggleLabel: { color: tokens.colors.textPrimary, fontSize: 15, fontWeight: '600', flex: 1, paddingRight: tokens.spacing.md },
    actionBar: {
      paddingHorizontal: tokens.spacing.xl,
      paddingBottom: tokens.spacing.md,
      paddingTop: tokens.spacing.xs,
    },
    actionBarCard: {
      maxWidth: 980,
      alignSelf: 'center',
      width: '100%',
      borderRadius: tokens.radii.lg,
    },
  });

export default Discounts;
