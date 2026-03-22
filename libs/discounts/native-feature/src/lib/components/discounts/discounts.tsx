import React, { useCallback, useMemo, useState } from 'react';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
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
import { StationService } from '@pos/settings/data-access';
import { StoreInfoEntityMapper, StoreInfoService } from '@pos/store-info/data-access';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import {
  buildDefinitionEntity,
  buildPolicyEntity,
  defaultDefinitionValues,
  defaultPolicyValues,
  DefinitionFormValues,
  mapDefinitionToForm,
  mapPolicyToForm,
  PolicyFormValues,
} from './discounts.helpers';
import { useDiscountsStyles } from './discounts.styles';
import { DiscountsListScreen } from './discounts-list-screen';
import { DiscountDefinitionFields } from './discount-definition-fields';
import { DiscountPolicyFields } from './discount-policy-fields';

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
  const numericValue = Number(values.value || 0);
  const minSubtotal = Number(values.minSubtotal || 0);
  const trigger = values.type === 'PROMO_CODE'
    ? `when promo code ${values.code.trim() || 'CODE'} is entered`
    : values.type === 'AUTOMATIC'
      ? 'automatically'
      : 'manually';
  const qualifiers: string[] = [];
  const methodValue = formatMethodValue(
    values.method,
    Number.isFinite(numericValue) ? numericValue : null
  );

  if (values.minSubtotal && Number.isFinite(minSubtotal)) {
    qualifiers.push(`subtotal reaches $${minSubtotal.toFixed(2)}`);
  }
  if (values.minQuantity) qualifiers.push(`quantity reaches ${values.minQuantity}`);
  if ((values.daysOfWeek || []).length || values.startTime || values.endTime) {
    qualifiers.push('schedule restrictions are met');
  }
  if ((values.excludedProductIds || []).length || (values.excludedCategoryIds || []).length) {
    qualifiers.push('configured exclusions stay blocked');
  }

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
  const styles = useDiscountsStyles(tokens);
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

  const empty = config.type === 'definition' ? definitions.length === 0 : policies.length === 0;

  return (
    <DiscountsListScreen
      config={config}
      empty={empty}
      loading={loading}
      keyLabel={key}
      definitions={definitions}
      policies={policies}
      styles={styles}
      buildDefinitionMeta={buildDefinitionMeta}
      buildPolicyMeta={buildPolicyMeta}
      onNavigate={(screen, params) => (navigation.navigate as any)(screen, params)}
    />
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
  const styles = useDiscountsStyles(tokens);
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

  const definitionPreview = buildDefinitionPreview(form.watch());

  return (
    <DiscountDefinitionFields
      form={form}
      styles={styles}
      title={title}
      subtitle={
        promoMode
          ? 'Create or edit a code-based discount definition.'
          : 'Create or edit a manual or automatic discount definition.'
      }
      promoMode={promoMode}
      loading={loading}
      busy={busy}
      editingId={editingId}
      showAdvanced={showAdvanced}
      definitionPreview={definitionPreview}
      categoryOptions={categoryOptions}
      productOptions={productOptions}
      storeOptions={storeOptions}
      stationOptions={stationOptions}
      onToggleAdvanced={() => setShowAdvanced((current) => !current)}
      onSave={form.handleSubmit(save)}
      onCancel={() => navigation.goBack()}
    />
  );
}

export function PolicyEditor({ navigation, route }: DiscountEditorProps) {
  const editingId = (route.params as { id?: string } | undefined)?.id;
  const tokens = useDesignTokens();
  const styles = useDiscountsStyles(tokens);
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
    <DiscountPolicyFields
      form={form}
      styles={styles}
      editingId={editingId}
      loading={loading}
      busy={busy}
      onSave={form.handleSubmit(save)}
      onCancel={() => navigation.goBack()}
    />
  );
}

export default Discounts;
