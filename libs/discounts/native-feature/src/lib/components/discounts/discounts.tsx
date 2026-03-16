import React, { useCallback, useMemo, useState } from 'react';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import {
  buildDefinitionEntity,
  buildPolicyEntity,
  dayOfWeekOptions,
  defaultDefinitionValues,
  defaultPolicyValues,
  definitionTypeOptions,
  DefinitionFormValues,
  mapDefinitionToForm,
  mapPolicyToForm,
  methodOptions,
  PolicyFormValues,
  roleOptions,
  scopeOptions,
  stackModeOptions,
  statusOptions,
} from './discounts.helpers';

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

const formatMethodValue = (method?: string | null, value?: number | null) => {
  if (value == null) return 'No value';
  if (method === 'PERCENT') return `${value}% off`;
  if (method === 'AMOUNT') return `$${value.toFixed(2)} off`;
  if (method === 'FINAL_PRICE') return `Final price $${value.toFixed(2)}`;
  return String(value);
};

const buildDefinitionMeta = (item: DiscountDefinitionEntity) => {
  const details = [`${item.scope} • ${formatMethodValue(item.method, item.value)}`];
  if (item.startDate || item.endDate) {
    details.push('Scheduled');
  }
  if (item.excludedProductIds?.length || item.excludedCategoryIds?.length) {
    details.push('Has exclusions');
  }
  if (item.stationIds?.length) {
    details.push('Station scoped');
  }

  return details.join(' • ');
};

const buildPolicyMeta = (item: EmployeeDiscountPolicyEntity) => {
  const details = [];
  details.push(`Role ${item.roleKey || 'custom'}`);
  details.push(item.canUsePromoCodes ? 'Promo codes on' : 'Promo codes off');
  details.push(item.canApplyOrderDiscount ? 'Order discounts on' : 'Order discounts off');
  if (item.requireApprovalForAnyPriceOverride) {
    details.push('Override approval required');
  }
  return details.join(' • ');
};

const buildDefinitionPreview = (values: DefinitionFormValues) => {
  const scope = values.scope === 'ORDER' ? 'entire order' : 'eligible cart lines';
  const methodValue = formatMethodValue(values.method, values.value);
  const trigger = values.type === 'PROMO_CODE'
    ? `when promo code ${values.code.trim() || 'CODE'} is entered`
    : values.type === 'AUTOMATIC'
      ? 'automatically'
      : 'manually';
  const qualifiers = [];

  if (values.minSubtotal) qualifiers.push(`subtotal reaches $${values.minSubtotal.toFixed(2)}`);
  if (values.minQuantity) qualifiers.push(`quantity reaches ${values.minQuantity}`);
  if (values.daysOfWeek.length || values.startTime || values.endTime) qualifiers.push('schedule restrictions are met');
  if (values.excludedProductIds.length || values.excludedCategoryIds.length) qualifiers.push('configured exclusions stay blocked');

  return `This discount will apply ${methodValue} to the ${scope} ${trigger}${qualifiers.length ? ` when ${qualifiers.join(' and ')}` : ''}.`;
};

type DiscountScreenName = keyof typeof sectionConfig;
type NavigationShape = NativeStackNavigationProp<Record<string, object | undefined>>;
type RouteShape = RouteProp<Record<string, object | undefined>, string>;

interface DiscountsProps {
  navigation: NavigationShape;
  route: RouteShape;
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
                            <View style={styles.metaChipRow}>
                              {'type' in item ? (
                                <>
                                  <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>{item.type}</Text>
                                  </View>
                                  <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>{item.status}</Text>
                                  </View>
                                </>
                              ) : (
                                <View style={styles.metaChip}>
                                  <Text style={styles.metaChipText}>
                                    {item.employeeId ? 'Employee override' : 'Role policy'}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.listMeta}>
                              {'type' in item
                                ? buildDefinitionMeta(item)
                                : buildPolicyMeta(item)}
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
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  const definitionPreview = buildDefinitionPreview(form.watch());

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
                    <View style={styles.previewCard}>
                      <Text style={styles.previewTitle}>This discount will…</Text>
                      <Text style={styles.previewBody}>{definitionPreview}</Text>
                    </View>
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Eligibility</Text>
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
                  </UICard>

                  <UICard style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Schedule</Text>
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
                    <Pressable
                      style={styles.advancedToggle}
                      onPress={() => setShowAdvanced((current) => !current)}
                    >
                      <Text style={styles.advancedToggleText}>
                        {showAdvanced ? 'Hide advanced rules' : 'Show advanced rules'}
                      </Text>
                    </Pressable>
                    {showAdvanced ? (
                      <>
                        <View style={styles.formColumnWide}>
                          <Text style={styles.fieldLabel}>Days of week</Text>
                          <UIOverlayMultiSelect
                            name="daysOfWeek"
                            title="Select days of week"
                            emptyLabel="Choose days"
                            list={dayOfWeekOptions}
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
                      </>
                    ) : null}
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
    metaChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.xs, marginTop: tokens.spacing.xs },
    metaChip: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: `${tokens.colors.accent}44`,
      backgroundColor: `${tokens.colors.accent}18`,
      alignSelf: 'flex-start',
    },
    metaChipText: { color: tokens.colors.accent, fontSize: 11, fontWeight: '800' },
    listMeta: { color: tokens.colors.textSecondary, fontSize: 14, marginTop: 4 },
    editHint: { color: tokens.colors.accent, fontSize: 13, fontWeight: '700' },
    inactivePill: { borderRadius: 999, backgroundColor: '#3f1d1d', paddingHorizontal: 10, paddingVertical: 6 },
    inactivePillText: { color: '#fca5a5', fontSize: 12, fontWeight: '800' },
    sectionCard: { marginBottom: tokens.spacing.lg },
    sectionTitle: { color: tokens.colors.textPrimary, fontSize: 19, fontWeight: '700', marginBottom: tokens.spacing.sm },
    previewCard: {
      marginTop: tokens.spacing.md,
      borderRadius: tokens.radii.md,
      borderWidth: 1,
      borderColor: tokens.colors.border,
      backgroundColor: tokens.colors.surfaceMuted,
      padding: tokens.spacing.sm,
    },
    previewTitle: { color: tokens.colors.textPrimary, fontSize: 14, fontWeight: '800', marginBottom: 4 },
    previewBody: { color: tokens.colors.textSecondary, fontSize: 13, lineHeight: 18 },
    fieldLabel: { color: tokens.colors.textSecondary, fontSize: 13, fontWeight: '700', marginTop: tokens.spacing.xs },
    formGrid: { flexDirection: 'row', gap: tokens.spacing.md },
    formColumn: { flex: 1 },
    formColumnWide: { width: '100%' },
    advancedToggle: {
      marginVertical: tokens.spacing.sm,
      borderRadius: tokens.radii.sm,
      borderWidth: 1,
      borderColor: `${tokens.colors.accent}44`,
      backgroundColor: `${tokens.colors.accent}12`,
      paddingVertical: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.sm,
      alignItems: 'center',
    },
    advancedToggleText: { color: tokens.colors.accent, fontSize: 13, fontWeight: '800' },
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
